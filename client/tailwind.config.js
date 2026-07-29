export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17211b',
        paper: '#f7f6f1',
        panel: '#ffffff',
        line: '#dedbd0',
        action: '#275c4a',
        muted: '#69746e'
      },
      boxShadow: {
        low: '0 0 0 1px rgba(23,33,27,.06), 0 1px 2px rgba(23,33,27,.05)'
      }
    }
  },
  plugins: []
};
