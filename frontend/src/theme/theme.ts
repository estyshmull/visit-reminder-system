import { createTheme } from '@mui/material/styles'

// Hebrew-friendly theme (fonts should be loaded in index.html or via CSS)
const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: ['Heebo', 'Rubik', 'Arial', 'sans-serif'].join(','),
  },
  components: {
    MuiTypography: {
      defaultProps: {
        dir: 'rtl',
      },
    },
  },
})

export default theme
