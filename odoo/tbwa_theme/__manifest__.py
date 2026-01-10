# -*- coding: utf-8 -*-
{
    'name': 'TBWA Theme',
    'version': '16.0.1.0.0',
    'category': 'Theme',
    'summary': 'TBWA Agency Databank Custom Theme',
    'description': """
        TBWA Agency Databank Custom Theme for Odoo
        ==========================================

        This module applies the TBWA brand theme to the Odoo backend,
        ensuring visual consistency with the React frontend application.

        Features:
        - TBWA brand colors (Yellow, Turquoise, Black)
        - Custom typography using Inter font
        - Unified design tokens matching React frontend
        - Light and Dark mode support
        - System Mode: Muted, professional colors (like Claude/ChatGPT)
        - Custom sidebar, navigation, and card styling

        Theme Tokens:
        - Primary: TBWA Yellow (#FFDD00)
        - Secondary: TBWA Turquoise (#00FFAA)
        - Backgrounds, borders, and UI elements
    """,
    'author': 'TBWA Agency',
    'website': 'https://tbwa.com',
    'license': 'LGPL-3',
    'depends': ['web'],
    'data': [
        'views/assets.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'tbwa_theme/static/src/scss/variables.scss',
            'tbwa_theme/static/src/scss/primary_variables.scss',
            'tbwa_theme/static/src/scss/backend.scss',
            'tbwa_theme/static/src/scss/components.scss',
            'tbwa_theme/static/src/scss/dark_mode.scss',
            'tbwa_theme/static/src/scss/system_mode.scss',
            'tbwa_theme/static/src/js/dark_mode.js',
            'tbwa_theme/static/src/xml/dark_mode_toggle.xml',
        ],
        'web.assets_frontend': [
            'tbwa_theme/static/src/scss/variables.scss',
            'tbwa_theme/static/src/scss/frontend.scss',
        ],
    },
    'images': [
        'static/description/banner.png',
    ],
    'installable': True,
    'auto_install': False,
    'application': False,
}
