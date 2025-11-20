/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import { aliases, md } from 'vuetify/iconsets/md' 
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'


export default createVuetify({
  theme: {
    defaultTheme: 'light',
  },
  icons: {
    defaultSet: 'md',
    aliases,
    sets: { md }
  }
});

