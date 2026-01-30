# TradeMind AI - Trading Web Application

AI-Powered Trading Intelligence platform that provides real-time market analysis, trading signals, and portfolio management.

## 🚀 Features

- **AI Trading Signals**: Machine learning-powered buy/sell recommendations
- **Real-time Dashboard**: Live portfolio tracking and market data
- **Risk Management**: Smart stop-loss and target price calculations
- **Market Watch**: Monitor your favorite stocks with AI sentiment analysis
- **Trade History**: Complete trading history with P&L tracking
- **Alert System**: Price and signal notifications
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/trademind-ai.git
   cd trademind-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   The application will automatically open at `http://localhost:3000`

## 📦 Available Scripts

- `npm start` - Start development server with live reload
- `npm run dev` - Start development server with file watching
- `npm run build` - Build production-ready minified files
- `npm run serve` - Serve the application using http-server
- `npm run lint` - Run ESLint for code quality
- `npm run format` - Format code using Prettier

## 🏗️ Project Structure

```
trademind-ai/
├── index.html          # Main dashboard page
├── login.html          # Authentication page
├── styles.css          # Dashboard styles
├── login-styles.css    # Login page styles
├── script.js           # Dashboard functionality
├── login-script.js     # Authentication logic
├── package.json        # NPM configuration
└── README.md          # Project documentation
```

## 🎯 Usage

### Authentication
1. Open the application (starts with login page)
2. **Create Account**: Enter name, email, and password
3. **Sign In**: Use existing credentials
4. **Social Login**: Use Google or Apple (demo mode)

### Trading Dashboard
- **Portfolio Overview**: View your balance, P&L, and performance
- **AI Signals**: Browse and execute AI-generated trading recommendations
- **Market Watch**: Monitor live market data and indices
- **Trade History**: Review past trades and performance metrics
- **Alerts**: Set up price and signal notifications

### Key Features
- **Real-time Updates**: Market data updates every 5 seconds
- **Interactive Charts**: Portfolio performance and market distribution
- **Signal Filtering**: Filter by signal type and confidence level
- **User Menu**: Access profile settings and logout

## 🔧 Configuration

### Development
- The app uses `live-server` for hot reloading during development
- Default port: 3000
- Auto-opens login page on start

### Production
- Run `npm run build` to create minified assets
- Deploy the generated files to any web server
- No backend required - uses localStorage for demo data

## 🎨 Customization

### Styling
- Modify `styles.css` for dashboard appearance
- Update `login-styles.css` for authentication pages
- Uses CSS Grid and Flexbox for responsive layouts

### Functionality
- Edit `script.js` for dashboard features
- Modify `login-script.js` for authentication logic
- Add new sections by updating HTML and corresponding JS

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Security Notes

**Demo Mode**: This application uses localStorage for demonstration purposes.

**Production Considerations**:
- Implement proper backend authentication
- Use secure JWT tokens
- Add HTTPS encryption
- Implement rate limiting
- Add input sanitization

## 🚀 Deployment

### Static Hosting (Recommended)
```bash
# Build the project
npm run build

# Deploy to platforms like:
# - Vercel
# - Netlify
# - GitHub Pages
# - AWS S3
```

### Local Server
```bash
# Using Node.js http-server
npm run serve

# Using Python
python -m http.server 3000

# Using PHP
php -S localhost:3000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chart.js for beautiful charts
- Font Awesome for icons
- Modern CSS Grid and Flexbox for layouts
- AI/ML concepts for trading signals

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@trademind-ai.com
- Documentation: [Wiki](https://github.com/your-username/trademind-ai/wiki)

---

**Disclaimer**: This platform provides AI-assisted trading insights for educational purposes only. Users are solely responsible for their trading decisions and financial risks.