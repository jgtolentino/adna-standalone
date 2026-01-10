"""Transform Odoo data to Scout schema format."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from dataclasses import dataclass, asdict


@dataclass
class ScoutTransaction:
    """Scout transaction record (bronze layer)."""

    source_id: str
    source_system: str = "odoo"
    transaction_code: str = ""
    store_id: Optional[str] = None
    timestamp: Optional[datetime] = None
    time_of_day: Optional[str] = None  # morning, afternoon, evening, night

    # Location
    region_code: Optional[str] = None
    province: Optional[str] = None
    city: Optional[str] = None
    barangay: Optional[str] = None

    # Product
    brand_name: Optional[str] = None
    sku: Optional[str] = None
    product_category: Optional[str] = None
    our_brand: bool = False
    tbwa_client_brand: bool = False

    # Transaction
    quantity: int = 0
    unit_price: float = 0.0
    gross_amount: float = 0.0
    discount_amount: float = 0.0
    net_amount: float = 0.0

    # Payment
    payment_method: str = "cash"

    # Customer
    customer_id: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    income: Optional[str] = None
    urban_rural: Optional[str] = None

    # Funnel
    funnel_stage: str = "purchase"
    basket_size: int = 1
    repeated_customer: bool = False

    # Metadata
    raw_data: Optional[Dict[str, Any]] = None
    synced_at: Optional[datetime] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for database insert."""
        d = asdict(self)
        # Convert datetime to ISO string
        if d.get("timestamp"):
            d["timestamp"] = d["timestamp"].isoformat()
        if d.get("synced_at"):
            d["synced_at"] = d["synced_at"].isoformat()
        return d


def get_time_of_day(hour: int) -> str:
    """Determine time of day from hour."""
    if hour < 12:
        return "morning"
    elif hour < 17:
        return "afternoon"
    elif hour < 21:
        return "evening"
    else:
        return "night"


def map_payment_method(payment_data: List[Dict[str, Any]]) -> str:
    """Map Odoo payment method to Scout enum."""
    if not payment_data:
        return "cash"

    # Get first payment method name
    method_name = ""
    if isinstance(payment_data[0], dict):
        method_name = payment_data[0].get("payment_method_id", ["", ""])[1].lower()
    elif isinstance(payment_data[0], (list, tuple)):
        method_name = str(payment_data[0]).lower()

    # Map to Scout payment methods
    if "gcash" in method_name:
        return "gcash"
    elif "maya" in method_name or "paymaya" in method_name:
        return "maya"
    elif "card" in method_name or "credit" in method_name or "debit" in method_name:
        return "card"
    else:
        return "cash"


def transform_pos_order(
    order: Dict[str, Any],
    lines: List[Dict[str, Any]],
    products: Dict[int, Dict[str, Any]],
    partners: Dict[int, Dict[str, Any]],
    tbwa_brands: List[str],
) -> List[ScoutTransaction]:
    """Transform a POS order into Scout transactions.

    Args:
        order: Odoo POS order dict
        lines: POS order lines for this order
        products: Dict of product_id -> product data
        partners: Dict of partner_id -> partner data
        tbwa_brands: List of TBWA client brand names

    Returns:
        List of ScoutTransaction objects (one per line item)
    """
    transactions: List[ScoutTransaction] = []

    # Parse order timestamp
    timestamp = None
    if order.get("date_order"):
        timestamp = datetime.fromisoformat(order["date_order"].replace("Z", "+00:00"))

    hour = timestamp.hour if timestamp else 12
    time_of_day = get_time_of_day(hour)

    # Get store/partner info
    store_id = None
    region_code = None
    province = None
    city = None
    barangay = None

    config_id = order.get("config_id")
    if config_id and isinstance(config_id, (list, tuple)):
        store_id = f"ST-{config_id[0]}"

    partner_id = order.get("partner_id")
    if partner_id and isinstance(partner_id, (list, tuple)):
        partner = partners.get(partner_id[0], {})
        region_code = partner.get("x_region_code")
        province = partner.get("x_province")
        city = partner.get("city")
        barangay = partner.get("x_barangay")

    # Payment method
    payment_method = map_payment_method(order.get("payment_ids", []))

    # Customer ID
    customer_id = None
    if partner_id and isinstance(partner_id, (list, tuple)):
        customer_id = f"CUST-{partner_id[0]}"

    # Transform each line item
    for line in lines:
        product_id = line.get("product_id")
        if not product_id or not isinstance(product_id, (list, tuple)):
            continue

        product = products.get(product_id[0], {})

        # Get brand name
        brand_name = "Unknown"
        brand_id = product.get("product_brand_id")
        if brand_id and isinstance(brand_id, (list, tuple)):
            brand_name = brand_id[1]
        elif product.get("name"):
            # Fallback: extract brand from product name
            brand_name = product["name"].split()[0] if product["name"] else "Unknown"

        # Get category
        category = "Unknown"
        categ_id = product.get("categ_id")
        if categ_id and isinstance(categ_id, (list, tuple)):
            category = categ_id[1]

        # Check if TBWA client brand
        is_tbwa = brand_name.lower() in [b.lower() for b in tbwa_brands]

        # Get SKU
        sku = product.get("default_code") or f"SKU-{product_id[0]}"

        # Calculate amounts
        qty = int(line.get("qty", 1))
        unit_price = float(line.get("price_unit", 0))
        discount = float(line.get("discount", 0))
        line_total = float(line.get("price_subtotal_incl", 0))
        discount_amount = (unit_price * qty * discount / 100) if discount else 0

        tx = ScoutTransaction(
            source_id=f"ODOO-{order['id']}-{line['id']}",
            transaction_code=order.get("name", ""),
            store_id=store_id,
            timestamp=timestamp,
            time_of_day=time_of_day,
            region_code=region_code,
            province=province,
            city=city,
            barangay=barangay,
            brand_name=brand_name,
            sku=sku,
            product_category=category,
            our_brand=False,  # Set based on business logic
            tbwa_client_brand=is_tbwa,
            quantity=qty,
            unit_price=unit_price,
            gross_amount=line_total + discount_amount,
            discount_amount=discount_amount,
            net_amount=line_total,
            payment_method=payment_method,
            customer_id=customer_id,
            funnel_stage="purchase",
            basket_size=len(lines),
            raw_data={"order": order, "line": line},
            synced_at=datetime.utcnow(),
        )
        transactions.append(tx)

    return transactions


# TBWA client brands (to be updated based on actual client list)
TBWA_CLIENT_BRANDS = [
    "Coca-Cola",
    "Sprite",
    "Royal Tru-Orange",
    "Nestea",
    "Milo",
    "Nescafe",
    "Oishi",
    "Piattos",
    "Marlboro",
    "Philip Morris",
    "Del Monte",
    "Century Tuna",
]
