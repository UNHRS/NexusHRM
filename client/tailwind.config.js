export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1c2434',
        paper: '#f6f8fa',
        panel: '#ffffff',
        line: '#dce2e8',
        action: '#1458cc',
        muted: '#64748b',
        sidebar: '#192233',
        success: '#278653',
        warning: '#d97706',
        destructive: '#c73e3e'
      },
      boxShadow: {
        low: '0 0 0 1px rgba(28,36,52,.06), 0 1px 2px rgba(28,36,52,.04)'
      }
    }
  },
  plugins: []
};
