# 🌾 FarmAssure

A decentralized agricultural marketplace built on Ethereum blockchain that connects farmers directly with buyers, ensuring transparent transactions and secure payments through smart contracts.

## 🚀 Features

### For Farmers
- **Crop Listings**: Create and manage crop listings with images, pricing, and delivery dates
- **Profile Management**: Set up detailed profiles with location and contact information
- **Request Management**: Review and respond to purchase requests from buyers
- **Secure Payments**: Receive payments through escrow system upon delivery confirmation

### For Buyers
- **Browse Crops**: Explore available crops from verified farmers
- **Purchase Requests**: Send purchase requests with custom messages
- **Order Tracking**: Monitor pending deliveries and order status
- **Secure Payments**: Pay through escrow system with automatic release upon delivery confirmation

### Platform Features
- **Blockchain Integration**: Built on Ethereum with smart contracts for secure transactions
- **IPFS Storage**: Decentralized image storage using Pinata IPFS
- **Multi-Currency Support**: ETH pricing with INR conversion
- **Responsive Design**: Modern UI with dark/light theme support
- **Real-time Updates**: Live transaction status and notifications

## 🛠️ Tech Stack

### Frontend
- **React 19** with Vite
- **Material-UI (MUI)** for components
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Ethers.js** for blockchain interaction
- **Web3Modal** for wallet connection

### Backend
- **Solidity** smart contracts
- **Truffle** for development and deployment
- **Ganache** for local blockchain testing

### Storage & APIs
- **Pinata IPFS** for decentralized file storage
- **CoinGecko API** for ETH/INR conversion rates

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Ganache](https://trufflesuite.com/ganache/) (for local blockchain)
- [MetaMask](https://metamask.io/) browser extension
- [Git](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/FarmAssure.git
cd FarmAssure
```

### 2. Set Up the Smart Contract

Navigate to the contract directory and install dependencies:
```bash
cd contract
npm install
```

Start Ganache (local blockchain):
- Open Ganache GUI
- Create a new workspace or use default settings
- Note the RPC server URL (usually `http://127.0.0.1:7545`)

Deploy the smart contract:
```bash
truffle migrate --reset
```

Copy the deployed contract address from the migration output.

### 3. Set Up the Frontend

Navigate to the frontend directory and install dependencies:
```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the frontend directory:
```env
VITE_CONTRACT_ADDRESS=your_deployed_contract_address_here
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
VITE_PINATA_JWT=your_pinata_jwt_token
```

**Note**: The contract address should be the one from step 2. For Pinata keys, sign up at [Pinata.cloud](https://pinata.cloud) and get your API credentials.

### 5. Update Contract Address

Update the contract address in the frontend code:
- Open `frontend/src/pages/LoginPage.jsx`
- Replace `CONTRACT_ADDRESS` with your deployed contract address

### 6. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Configuration

### Smart Contract Configuration

The smart contract is configured in `contract/truffle-config.js`:
- **Network**: Development (Ganache)
- **Port**: 7545
- **Solidity Version**: 0.8.19

### Frontend Configuration

Key configuration files:
- `frontend/vite.config.js` - Vite build configuration
- `frontend/tailwind.config.js` - Tailwind CSS configuration
- `frontend/src/services/pinataService.js` - IPFS storage configuration

## 📱 Usage

### Getting Started

1. **Connect Wallet**: Click "Connect Wallet" and select MetaMask
2. **Register**: Choose your role (Farmer or Buyer)
3. **Complete Profile**: Add your name, location, and contact information

### For Farmers

1. **Add Crop Listings**:
   - Click "Add New Crop" button
   - Upload crop image
   - Enter crop details (name, price, quantity, delivery date)
   - Submit listing

2. **Manage Requests**:
   - View incoming purchase requests
   - Accept or reject requests
   - Monitor your listings

### For Buyers

1. **Browse Crops**:
   - View all available crop listings
   - Filter by price, location, or crop type
   - Click on crops for detailed information

2. **Make Purchases**:
   - Send purchase requests with custom messages
   - Complete payment after farmer acceptance
   - Confirm delivery to release payment

## 🏗️ Project Structure

```
FarmAssure/
├── contract/                 # Smart contract directory
│   ├── contracts/
│   │   ├── FarmerPortal.sol  # Main smart contract
│   │   └── FarmerPortalBase.sol
│   ├── migrations/
│   └── truffle-config.js
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Main application pages
│   │   ├── services/        # API and blockchain services
│   │   └── App.jsx          # Main application component
│   ├── public/              # Static assets
│   └── package.json
└── README.md
```

## 🔐 Smart Contract Details

### Key Functions

**User Management**:
- `registerUser(uint8 role)` - Register as farmer or buyer
- `updateUserProfile(...)` - Update user profile information
- `getUserProfile(address)` - Get user profile data

**Crop Management**:
- `addListing(...)` - Add new crop listing
- `getAllListings()` - Get all available crops
- `getMyListings()` - Get farmer's own listings

**Purchase System**:
- `requestPurchase(...)` - Send purchase request
- `respondToPurchaseRequest(...)` - Accept/reject requests
- `completePurchase(...)` - Complete payment
- `confirmDelivery(...)` - Confirm delivery and release payment

### Security Features

- **Role-based Access Control**: Functions restricted to farmers or buyers
- **Escrow System**: Payments held in escrow until delivery confirmation
- **Input Validation**: Comprehensive checks for all inputs
- **Event Logging**: All major actions emit events for transparency

## 🌐 Deployment

### Smart Contract Deployment

1. **Testnet Deployment**:
   ```bash
   truffle migrate --network testnet
   ```

2. **Mainnet Deployment**:
   ```bash
   truffle migrate --network mainnet
   ```

### Frontend Deployment

1. **Build for Production**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel/Netlify**:
   - Connect your GitHub repository
   - Set environment variables
   - Deploy automatically

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/FarmAssure/issues) page
2. Create a new issue with detailed description
3. Contact the development team

## 🙏 Acknowledgments

- [Ethereum](https://ethereum.org/) for the blockchain platform
- [Material-UI](https://mui.com/) for the component library
- [Pinata](https://pinata.cloud/) for IPFS storage
- [Truffle](https://trufflesuite.com/) for development tools

## 📊 Roadmap

- [ ] Mobile app development
- [ ] Advanced search and filtering
- [ ] Rating and review system
- [ ] Multi-language support
- [ ] Integration with more blockchain networks
- [ ] Automated delivery tracking
- [ ] Insurance integration for crop protection

---

**FarmAssure** - Revolutionizing agriculture through blockchain technology 🌾✨
