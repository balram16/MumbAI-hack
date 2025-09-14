import React, { useState, useEffect } from "react";
import { BrowserProvider, Contract, ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { 
    Box, 
    Container, 
    Typography, 
    Button, 
    Grid, 
    Card, 
    CardContent, 
    CardActions, 
    TextField, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    DialogContentText,
    AppBar, 
    Toolbar, 
    IconButton, 
    MenuItem, 
    Select, 
    FormControl, 
    InputLabel,
    Paper,
    Chip,
    Avatar,
    CircularProgress,
    Divider,
    Alert,
    Snackbar,
    Tab,
    Tabs,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Badge,
    Skeleton,
    Tooltip,
    Fab
} from '@mui/material';
import { 
    Add as AddIcon, 
    Logout as LogoutIcon, 
    Person as PersonIcon, 
    FilterList as FilterListIcon,
    Agriculture as AgricultureIcon,
    AttachMoney as AttachMoneyIcon,
    CalendarMonth as CalendarMonthIcon,
    Inventory as InventoryIcon,
    CloudUpload as CloudUploadIcon,
    Image as ImageIcon,
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Notifications as NotificationsIcon,
    Delete as DeleteIcon,
    Sync as SyncIcon,
    Feedback as FeedbackIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { uploadImageToPinata, getIPFSGatewayURL, fetchIPFSImageDirectly } from '../services/pinataService';
import { getUserDisplayName, getProfileImageUrl } from '../services/profileService';
import Web3 from 'web3';
import { motion } from "framer-motion";
import { useTheme } from "../components/theme-provider";
import { ThemeToggle } from "../components/theme-toggle";
import { getEthInrRate, formatEthInr } from "../services/currencyService";


const CONTRACT_ADDRESS = "0x4843C1027987E2A017a9F88bC590f3130e8C7383";

const CONTRACT_ABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "farmer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "cropID",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountHeld",
          "type": "uint256"
        }
      ],
      "name": "CropBought",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "farmer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "cropName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "cropID",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "deliveryDate",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "imageCID",
          "type": "string"
        }
      ],
      "name": "CropListed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "farmer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "cropID",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountReleased",
          "type": "uint256"
        }
      ],
      "name": "DeliveryConfirmed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "farmer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "cropID",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        }
      ],
      "name": "PurchaseRequested",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "enum FarmerPortal.RequestStatus",
          "name": "status",
          "type": "uint8"
        }
      ],
      "name": "RequestStatusChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "profileImageCID",
          "type": "string"
        }
      ],
      "name": "UserProfileUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "enum FarmerPortal.UserRole",
          "name": "role",
          "type": "uint8"
        }
      ],
      "name": "UserRegistered",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "escrowBalances",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "users",
      "outputs": [
        {
          "internalType": "address",
          "name": "wallet",
          "type": "address"
        },
        {
          "internalType": "enum FarmerPortal.UserRole",
          "name": "role",
          "type": "uint8"
        },
        {
          "internalType": "bool",
          "name": "registered",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "profileImageCID",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "location",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "contact",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "role",
          "type": "uint8"
        }
      ],
      "name": "registerUser",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_profileImageCID",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_location",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_contact",
          "type": "string"
        }
      ],
      "name": "updateUserProfile",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_userAddress",
          "type": "address"
        }
      ],
      "name": "getUserProfile",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "enum FarmerPortal.UserRole",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_cropName",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_price",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_cropID",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_quantity",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_deliveryDate",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_imageCID",
          "type": "string"
        }
      ],
      "name": "addListing",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getMyListings",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "cropName",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "cropID",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "quantity",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "deliveryDate",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "farmer",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "imageCID",
              "type": "string"
            }
          ],
          "internalType": "struct FarmerPortal.CropListing[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getUserRole",
      "outputs": [
        {
          "internalType": "enum FarmerPortal.UserRole",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getAllListings",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "cropName",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "cropID",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "quantity",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "deliveryDate",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "farmer",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "imageCID",
              "type": "string"
            }
          ],
          "internalType": "struct FarmerPortal.CropListing[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "cropID",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "message",
          "type": "string"
        }
      ],
      "name": "requestPurchase",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "accept",
          "type": "bool"
        }
      ],
      "name": "respondToPurchaseRequest",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        }
      ],
      "name": "completePurchase",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    },
    {
      "inputs": [],
      "name": "getFarmerRequests",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "requestId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "cropID",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "quantity",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "buyer",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "farmer",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "internalType": "enum FarmerPortal.RequestStatus",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "string",
              "name": "message",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "internalType": "struct FarmerPortal.PurchaseRequest[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getBuyerRequests",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "requestId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "cropID",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "quantity",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "buyer",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "farmer",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "internalType": "enum FarmerPortal.RequestStatus",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "string",
              "name": "message",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "internalType": "struct FarmerPortal.PurchaseRequest[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getPendingDeliveries",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "cropID",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "quantity",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "buyer",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "farmer",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amountHeld",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "delivered",
              "type": "bool"
            }
          ],
          "internalType": "struct FarmerPortal.Purchase[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "cropID",
          "type": "uint256"
        }
      ],
      "name": "confirmDelivery",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

function FarmerDashboard({ account }) {
    const navigate = useNavigate();
    const [localAccount, setLocalAccount] = useState(account);
    const { theme } = useTheme();
    const [contract, setContract] = useState(null);
    const [web3, setWeb3] = useState(null);
    const [crops, setCrops] = useState([]);
    const [orders, setOrders] = useState([]);
    const [purchaseRequests, setPurchaseRequests] = useState([]);
    const [hasNewRequests, setHasNewRequests] = useState(false);
    const [cropName, setCropName] = useState("");
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [cultivationDate, setCultivationDate] = useState(null);
    const [cropImage, setCropImage] = useState(null);
    const [cropImagePreview, setCropImagePreview] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageCID, setImageCID] = useState("");
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [tabValue, setTabValue] = useState(0);
    const [farmerName, setFarmerName] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        cropId: null,
        cropName: ''
    });
    const [removedCropIds, setRemovedCropIds] = useState([]);
    const [sortBy, setSortBy] = useState('dateDesc');
    // Add state for bid details dialog
    const [bidDetailsDialog, setBidDetailsDialog] = useState({
        open: false,
        cropId: null,
        cropName: '',
        bids: []
    });
    // Add state for tracking new bids
    const [hasNewBids, setHasNewBids] = useState(false);
    const [forceRefresh, setForceRefresh] = useState(0);
    const [showDebugControls, setShowDebugControls] = useState(false);
    
    // Add missing state variables for image loading
    const [loadingImages, setLoadingImages] = useState({});
    const [fallbackAttempt, setFallbackAttempt] = useState({});
    const [directImageData, setDirectImageData] = useState({});
    
    // Add state variables for orders
    const [activeOrders, setActiveOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [hasNewOrders, setHasNewOrders] = useState(false);

    useEffect(() => {
        const init = async () => {
            await initializeContract();
        };
        init();

        // Add persistent MetaMask connection check with improved reliability
        const checkAndRestoreConnection = async () => {
            try {
                // Check if previous connection exists in localStorage
                const previousAccount = localStorage.getItem('farmerAccount');
                
                if (previousAccount && window.ethereum) {
                    // Get current accounts
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    
                    if (!accounts || accounts.length === 0) {
                        
                        
                        // Set loading state during reconnection attempt
                        setLoading(true);
                        
                        // Try silently requesting account access
                        try {
                            const newAccounts = await window.ethereum.request({ 
                                method: 'eth_requestAccounts',
                                params: [] // Empty params to make it more reliable
                            });
                            
                            if (newAccounts && newAccounts.length > 0) {
                                
                                setLocalAccount(newAccounts[0]);
                                localStorage.setItem('farmerAccount', newAccounts[0]);
                                
                                // Re-initialize contract with newly connected account
                                await initializeContract();
                            }
                        } catch (requestError) {
                            
                            // Record failed attempt to avoid too frequent re-prompts
                            const now = Date.now();
                            localStorage.setItem('lastMetaMaskConnectAttempt', now.toString());
                            
                            // Only show the error if we haven't shown it recently
                            const lastErrorTime = parseInt(localStorage.getItem('lastMetaMaskErrorTime') || '0');
                            if (now - lastErrorTime > 60000) { // Show error at most once per minute
                                setSnackbar({
                                    open: true,
                                    message: "MetaMask connection lost. Please click the MetaMask extension and connect your account.",
                                    severity: 'warning',
                                    duration: 10000
                                });
                                localStorage.setItem('lastMetaMaskErrorTime', now.toString());
                            }
                        } finally {
                            setLoading(false);
                        }
                    } else if (accounts[0] !== previousAccount) {
                        
                        setLocalAccount(accounts[0]);
                        localStorage.setItem('farmerAccount', accounts[0]);
                        
                        // Re-initialize contract with new account
                        await initializeContract();
                    } else {
                        
                        setLocalAccount(accounts[0]);
                    }
                }
            } catch (error) {
                console.error("Error in checkAndRestoreConnection:", error);
                setLoading(false);
            }
        };
        
        checkAndRestoreConnection();

        // Enhanced event listeners for account changes and connection
        if (window.ethereum) {
            // Detect account changes
            const handleAccountsChanged = (accounts) => {
                
                if (accounts && accounts.length > 0) {
                    setLocalAccount(accounts[0]);
                    localStorage.setItem('farmerAccount', accounts[0]);
                    // Re-initialize with new account
                    initializeContract();
                } else {
                    
                    // Don't clear the localAccount immediately - we'll try to reconnect on next check
                    
                    // Record that we've been disconnected so we can show appropriate UI
                    localStorage.setItem('metaMaskDisconnected', 'true');
                    localStorage.setItem('metaMaskDisconnectTime', Date.now().toString());
                    
                    // Show a notification but don't remove account from localStorage
                    setSnackbar({
                        open: true,
                        message: "MetaMask disconnected. Click the MetaMask extension to reconnect.",
                        severity: 'warning',
                        duration: 8000
                    });
                }
            };
            
            // Detect chain changes
            const handleChainChanged = (chainId) => {
                
                // Reload the page as recommended by MetaMask
                window.location.reload();
            };
            
            // Detect connection
            const handleConnect = (connectInfo) => {
                
                // Try to get accounts again
                window.ethereum.request({ method: 'eth_accounts' })
                    .then(accounts => {
                        if (accounts && accounts.length > 0) {
                            setLocalAccount(accounts[0]);
                            localStorage.setItem('farmerAccount', accounts[0]);
                        }
                    })
                    .catch(error => console.error("Error fetching accounts after connect:", error));
            };
            
            // Detect disconnection
            const handleDisconnect = (error) => {
                
                // Wait a bit then try to reconnect
                setTimeout(checkAndRestoreConnection, 1000);
            };
            
            // Set up event listeners
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
            window.ethereum.on('connect', handleConnect);
            window.ethereum.on('disconnect', handleDisconnect);
            
            // Set up periodic connection check (every 30 seconds)
            const connectionCheckInterval = setInterval(checkAndRestoreConnection, 30000);
            
            // Clean up event listeners on component unmount
            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
                window.ethereum.removeListener('connect', handleConnect);
                window.ethereum.removeListener('disconnect', handleDisconnect);
                clearInterval(connectionCheckInterval);
            };
        }
    }, []);

    // Refresh data when contract changes
    useEffect(() => {
        if (contract && localAccount) {
            fetchListings();
            fetchPurchaseRequests();
            fetchOrders();
        }
    }, [contract, localAccount]);

    useEffect(() => {
        if (account) {
            loadFarmerProfile();
        }
    }, [account]);

    // Add a useEffect hook to ensure zero quantity crops are properly marked as removed
    useEffect(() => {
        // When crops state changes, make sure all zero quantity crops are marked as removed
        if (crops.length > 0) {
            // Check for any crops with zero quantity that aren't marked as removed
            const needsUpdate = crops.some(crop => 
                crop.quantity && crop.quantity.toString() === "0" && !crop.isRemoved
            );
            
            if (needsUpdate) {
                
                setCrops(currentCrops => 
                    currentCrops.map(crop => 
                        crop.quantity && crop.quantity.toString() === "0" 
                            ? { ...crop, isRemoved: true } 
                            : crop
                    )
                );
            }
        }
    }, [crops]);

    // Add this useEffect hook below the existing ones
    useEffect(() => {
        // This effect runs once on component mount to ensure all zero quantity crops are marked as removed
        const ensureRemovedCropsMarked = () => {
            
            // Force a refresh of the listings to ensure they are properly loaded
            if (contract && localAccount) {
                fetchListings();
            }
        };
        
        ensureRemovedCropsMarked();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contract, localAccount]);

    // Add tracking for removed crops using localStorage
    useEffect(() => {
        // Load previously removed crops from localStorage when component mounts
        const loadRemovedCrops = () => {
            try {
                const storedRemovedCrops = localStorage.getItem('removedCrops');
                if (storedRemovedCrops) {
                    const removedCropsObj = JSON.parse(storedRemovedCrops);
                    
                    // Convert the object to an array of crop IDs if it's in object format
                    if (typeof removedCropsObj === 'object' && !Array.isArray(removedCropsObj)) {
                        const removedCropIds = Object.keys(removedCropsObj).filter(id => removedCropsObj[id]);
                        
                        setRemovedCropIds(removedCropIds);
                    } else if (Array.isArray(removedCropsObj)) {
                        
                        setRemovedCropIds(removedCropsObj);
                    }
                }
            } catch (error) {
                console.error("Error loading removed crops from localStorage:", error);
            }
        };
        
        loadRemovedCrops();
    }, []);

    // Add useEffect to check for new bids
    useEffect(() => {
        if (purchaseRequests && purchaseRequests.length > 0) {
            // Check if there are any pending requests with bids
            const newBids = purchaseRequests.some(request => 
                request.status.toString() === "0" && request.hasBid
            );
            
            setHasNewBids(newBids);
        }
    }, [purchaseRequests]);

    // Add a useEffect to refresh purchase requests when switching to the Purchase Requests tab
    useEffect(() => {
        if (tabValue === 1 && contract && localAccount) {
            
            fetchPurchaseRequests();
            
            // Clear the new requests notification when user views the tab
            if (hasNewRequests) {
                setHasNewRequests(false);
            }
        }
    }, [tabValue, contract, localAccount]);

    // Add a useEffect to refresh orders when switching to the Orders & Cultivation tab
    useEffect(() => {
        if (tabValue === 2 && contract && localAccount) {
            
            fetchOrders();
        }
    }, [tabValue, contract, localAccount]);

    // Add real-time refresh for purchase requests and orders
    useEffect(() => {
        if (!contract || !localAccount) return;
        
        // Initial fetch
        fetchPurchaseRequests();
        fetchOrders();
        
        // Set up interval to check for new requests and orders every 10 seconds
        const intervalId = setInterval(() => {
            
            fetchPurchaseRequests();
            fetchOrders();
            checkForCompletedPurchases();
        }, 10000); // 10 seconds
        
        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, [contract, localAccount]);

    // Add event listener for contract events to detect when purchases are completed
    useEffect(() => {
        if (!contract || !localAccount) return;
        
        // Listen for CropBought event (when buyer completes purchase)
        const cropBoughtHandler = (buyer, farmer, cropID, quantity, amountHeld) => {
            
            
            // Only process if this is for the current farmer
            if (farmer.toLowerCase() === localAccount.toLowerCase()) {
                
                
                // Find the corresponding request ID from purchase requests
                const correspondingRequest = purchaseRequests.find(req => 
                    req.cropID.toString() === cropID.toString() && 
                    req.buyer.toLowerCase() === buyer.toLowerCase()
                );
                
                if (correspondingRequest) {
                    // Store this completed purchase in localStorage
                    const completedPurchases = JSON.parse(localStorage.getItem('farmerCompletedPurchases') || '[]');
                    if (!completedPurchases.includes(correspondingRequest.requestId.toString())) {
                        completedPurchases.push(correspondingRequest.requestId.toString());
                        localStorage.setItem('farmerCompletedPurchases', JSON.stringify(completedPurchases));
                        
                    }
                }
                
                // Update the order status to indicate payment received
                setActiveOrders(prevOrders => 
                    prevOrders.map(order => 
                        order.cropID.toString() === cropID.toString()
                            ? { ...order, status: 'payment_received' }
                            : order
                    )
                );
                
                // Wait a bit for the blockchain to update, then refresh
                setTimeout(() => {
                    fetchOrders();
                    fetchPurchaseRequests();
                }, 2000);
                
                // Show notification
                setSnackbar({
                    open: true,
                    message: `Payment received for Crop ${cropID}! Check the Orders & Cultivation tab.`,
                    severity: 'success',
                    duration: 5000
                });
            }
        };
        
        // Listen for DeliveryConfirmed event (when delivery is confirmed)
        const deliveryConfirmedHandler = (buyer, farmer, cropID, amountReleased) => {
            
            
            // Only process if this is for the current farmer
            if (farmer.toLowerCase() === localAccount.toLowerCase()) {
                
                
                // Wait a bit for the blockchain to update, then refresh
                setTimeout(() => {
                    fetchOrders();
                }, 2000);
            }
        };
        
        // Set up event listeners
        contract.events.CropBought({}, cropBoughtHandler);
        contract.events.DeliveryConfirmed({}, deliveryConfirmedHandler);
        
        // Cleanup event listeners on unmount
        return () => {
            contract.events.CropBought({}, cropBoughtHandler).removeAllListeners();
            contract.events.DeliveryConfirmed({}, deliveryConfirmedHandler).removeAllListeners();
        };
    }, [contract, localAccount]);

    // Function to check for completed purchases and move them to orders
    const checkForCompletedPurchases = async () => {
        try {
            if (!contract || !localAccount) return;
            
            // Get all purchase requests
            const allRequests = await contract.methods.getFarmerRequests().call({from: localAccount});
            
            // Since we can't call getPendingDeliveries(), we'll work with the accepted requests
            // and determine which ones have been completed by checking their status
            const acceptedRequests = allRequests.filter(request => 
                request.status.toString() === "1" && 
                request.buyer !== "0x0000000000000000000000000000000000000000"
            );
            
            // For now, we'll consider accepted requests as potential orders
            // In a real implementation, you might have a way to check if payment was made
            
            
            // Update local state to reflect accepted requests
            setPurchaseRequests(prevRequests => 
                prevRequests.filter(request => 
                    !acceptedRequests.some(accepted => 
                        accepted.requestId.toString() === request.requestId.toString()
                    )
                )
            );
            
            // Also check if we need to update the hasNewRequests state
            if (purchaseRequests.length > 0) {
                const hasAcceptedRequests = purchaseRequests.some(request => 
                    acceptedRequests.some(accepted => 
                        accepted.requestId.toString() === request.requestId.toString()
                    )
                );
                
                if (hasAcceptedRequests) {
                    
                    // The requests will be filtered out in the next fetchPurchaseRequests call
                }
            }
            
        } catch (error) {
            console.error("Error checking for completed purchases:", error);
        }
    };

    // Function to manually sync purchase requests and orders
    const syncPurchaseRequestsAndOrders = async () => {
        try {
            setLoading(true);
            
            
            // Fetch both purchase requests and orders
            await Promise.all([
                fetchPurchaseRequests(),
                fetchOrders()
            ]);
            
            // Check for completed purchases
            await checkForCompletedPurchases();
            
            setSnackbar({
                open: true,
                message: "Purchase requests and orders synchronized successfully!",
                severity: 'success'
            });
            
        } catch (error) {
            console.error("Error syncing purchase requests and orders:", error);
            setSnackbar({
                open: true,
                message: `Error syncing: ${error.message}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Add more frequent refresh when user is on Purchase Requests tab
    useEffect(() => {
        if (!contract || !localAccount || tabValue !== 1) return;
        
        // More frequent refresh when actively viewing requests (every 5 seconds)
        const activeIntervalId = setInterval(() => {
            
            fetchPurchaseRequests();
        }, 5000); // 5 seconds
        
        return () => clearInterval(activeIntervalId);
    }, [contract, localAccount, tabValue]);

    const initializeContract = async () => {
        setLoading(true);
        let contractInstance = null;
        
        try {
            
            
            // Check if web3 is injected by MetaMask
            if (!window.ethereum) {
                throw new Error("Please install MetaMask to use this app.");
            }

            // Initialize web3 with proper error handling
            let web3Instance;
            try {
                web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);
                window.web3 = web3Instance; // For global access
                
            } catch (web3Error) {
                console.error("Error initializing Web3:", web3Error);
                throw new Error("Failed to initialize Web3. Please refresh and try again.");
            }

            // Try to get previously connected account first
            try {
                // Reset MetaMask disconnected flag if it was set previously
                if (localStorage.getItem('metaMaskDisconnected') === 'true') {
                    localStorage.removeItem('metaMaskDisconnected');
                    localStorage.removeItem('metaMaskDisconnectTime');
                    
                }
                
                const accounts = await window.ethereum.request({ 
                    method: 'eth_accounts',
                    params: [] 
                });
                
                if (accounts && accounts.length > 0) {
                    const account = accounts[0];
                    setLocalAccount(account);
                    localStorage.setItem('farmerAccount', account);
                    
                } else {
                    // If no existing connection, request account access
                    
                    
                    // Check for previous session key - this is for users who have allowed the dApp before
                    const previousAccount = localStorage.getItem('farmerAccount');
                    if (previousAccount) {
                        
                    }
                    
                    const requestedAccounts = await window.ethereum.request({ 
                        method: 'eth_requestAccounts',
                        params: []
                    });
                    
                    if (!requestedAccounts || requestedAccounts.length === 0) {
                        throw new Error("No accounts found. Please check MetaMask.");
                    }
            
                    // Set local account
                    const account = requestedAccounts[0];
                    setLocalAccount(account);
                    localStorage.setItem('farmerAccount', account);
                    
                    
                    // Store connection timestamp
                    localStorage.setItem('metaMaskLastConnectTime', Date.now().toString());
                }
            } catch (accountError) {
                console.error("Error accessing accounts:", accountError);
                
                // Handle specific MetaMask errors
                if (accountError.code === 4001) {
                    // User rejected request
                    throw new Error("MetaMask connection rejected. Please connect to continue.");
                } else if (accountError.code === -32002) {
                    // Request already pending
                    throw new Error("MetaMask connection request already pending. Please check the MetaMask extension.");
                } else if (accountError.code === 4100) {
                    // Unauthorized - can happen if user manually disconnected via MetaMask
                    throw new Error("MetaMask account not authorized. Please connect via the MetaMask extension.");
                } else {
                    throw accountError;
                }
            }

            // Create contract instance with error handling
            try {
                
                contractInstance = new web3Instance.eth.Contract(
                    CONTRACT_ABI,
                    CONTRACT_ADDRESS
                );
                
                if (!contractInstance) {
                    throw new Error("Failed to create contract instance - instance is null");
                }
                
                if (!contractInstance.methods) {
                    throw new Error("Contract instance missing methods property");
                }
                
                // Log available methods for debugging
                
                
                // Test a simple call to verify the connection
                try {
                    
                    const testAccount = await contractInstance.methods.getUserRole(localAccount).call({from: localAccount});
                    
                } catch (testError) {
                    
                    // Continue anyway - the contract might not have this specific method
                }
                
                // Store contract instance in state
                setContract(contractInstance);
                
                // Record successful initialization
                localStorage.setItem('lastContractInitTime', Date.now().toString());
                localStorage.removeItem('initFailCount');
                
                
            } catch (contractError) {
                console.error("Error creating contract instance:", contractError);
                throw new Error("Failed to connect to blockchain contract. Please check your network connection.");
            }
            
            // Return the contract instance for immediate use in subsequent calls
            return contractInstance;
        } catch (error) {
            console.error("Error initializing contract:", error);
            
            // Track failed init attempts
            const failCount = parseInt(localStorage.getItem('initFailCount') || '0') + 1;
            localStorage.setItem('initFailCount', failCount.toString());
            
            // Only show snackbar for errors if we haven't shown too many
            if (failCount <= 3) {
                setSnackbar({
                    open: true,
                    message: `Connection error: ${error.message}`,
                    severity: 'error',
                    duration: 6000
                });
            }
            
            return null;
        } finally {
            setLoading(false);
        }
    };

    const loadFarmerProfile = async () => {
        try {
            const displayName = await getUserDisplayName(account);
            setFarmerName(displayName);
            
            // Attempt to get the profile image
            const profileImage = await getProfileImageUrl(account);
            if (profileImage) {
                setProfileImageUrl(profileImage);
            }
        } catch (error) {
            console.error("Error loading farmer profile:", error);
        }
    };

    // Function to fetch user profile data from contract
    const fetchUserProfile = async (contractInstance, userAddress) => {
        try {
            if (!contractInstance) contractInstance = contract;
            if (!userAddress) userAddress = localAccount;
            
            const profile = await contractInstance.methods.getUserProfile(userAddress).call();
            
            
            // Profile returns [name, profileImageCID, location, contact, role]
            if (profile && profile.length >= 2) {
                const [name, profileImageCID] = profile;
                setFarmerName(name || "Farmer");
                
                if (profileImageCID) {
                    const imageUrl = getIPFSGatewayURL(profileImageCID);
                    setProfileImageUrl(imageUrl);
                }
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const fetchListings = async () => {
        try {
            if (!contract || !contract.methods) {
                console.error("Contract not initialized in fetchListings");
                return;
            }
            
            const listings = await contract.methods.getMyListings().call({from: localAccount});
            
            // Apply filtering: Remove any crops that are in our removedCropIds array
            const filteredListings = listings.filter(listing => {
                const cropId = listing.cropID.toString();
                const isZeroQuantity = listing.quantity && listing.quantity.toString() === "0";
                const isInRemovedList = removedCropIds.includes(cropId);
                
                // Log details for debugging
                
                
                // Keep this crop only if it's not zero quantity AND not in the removed list
                return !isZeroQuantity && !isInRemovedList;
            });
            
            
            
            // Debug image CIDs and zero quantity crops
            
            
            const enrichedListings = await Promise.all(filteredListings.map(async (listing) => {
                // Convert price from wei to ether
                const priceInEth = web3 ? web3.utils.fromWei(listing.price, 'ether') : '0';
                
                // Get the IPFS gateway URL for the image if available
                const imageUrl = listing.imageCID 
                    ? getIPFSGatewayURL(listing.imageCID) 
                    : null;

                return {
                    ...listing,
                    priceInEth,
                    imageUrl,
                    isRemoved: false // All crops here are already filtered and should not be removed
                };
            }));

            
            setCrops(enrichedListings);
        } catch (error) {
            console.error("Error fetching listings:", error);
            setSnackbar({
                open: true,
                message: "Error fetching listings. Please try again.",
                severity: 'error'
            });
        }
    };

    const fetchOrdersForFarmer = async (contractInstance) => {
        try {
            // This would need to be implemented in your contract
            // For now, we'll leave it empty as a placeholder
            // setOrders(await contractInstance.getOrdersForFarmer());
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    // Add a function to get bid information from localStorage with better error handling
    const getBidForRequest = (requestId) => {
        try {
            if (!requestId) {
                return null;
            }
            
            // First try getting from cropBids
            const bids = JSON.parse(localStorage.getItem('cropBids') || '{}');
            const bid = bids[requestId];
            
            // If bid exists and has valid price data, use it
            if (bid && bid.bidPrice && bid.bidPrice !== '0') {
                
                return bid;
            } 
            
            // For debug: look at all stored bids
            
            
            // If not found, look for manually created bids for testing
            const debugBids = JSON.parse(localStorage.getItem('debugBids') || '{}');
            if (debugBids[requestId]) {
                
                return debugBids[requestId];
            }
            
            // If nothing found, return null
            
            return null;
        } catch (error) {
            console.error(`Error getting bid information for request ${requestId}:`, error);
            return null;
        }
    };

    // Update fetchPurchaseRequests to include bid information
    const fetchPurchaseRequests = async () => {
        try {
            if (!contract || !contract.methods) {
                console.error("Contract not initialized in fetchPurchaseRequests");
                return;
            }

            
            
            
            
            let requests = await contract.methods.getFarmerRequests().call({from: localAccount});
            // Merge with PurchaseRequested events (no server-side filter; filter locally)
            try {
                const web3Instance = window.web3 || web3;
                if (web3Instance?.eth?.getBlockNumber) {
                    const events = await contract.getPastEvents('PurchaseRequested', {
                        fromBlock: 0,
                        toBlock: 'latest'
                    });
                    const farmerAddr = (localAccount || '').toLowerCase();
                    const seen = new Set((requests || []).map(r => (r.requestId || '').toString()));
                    const extras = (events || [])
                        .map(ev => ev.returnValues || {})
                        .filter(rv => (rv.farmer || '').toLowerCase() === farmerAddr)
                        .map(rv => {
                            const rid = (rv.requestId || '').toString();
                            if (!rid || seen.has(rid)) return null;
                            return {
                                requestId: rid,
                                cropID: rv.cropID,
                                quantity: rv.quantity,
                                buyer: rv.buyer,
                                farmer: rv.farmer,
                                price: '0',
                                status: '0',
                                message: '',
                                timestamp: Date.now().toString()
                            };
                        })
                        .filter(Boolean);
                    if (extras.length > 0) requests = [...requests, ...extras];
                }
            } catch (_) {}
            
            
            // Filter out empty requests (address(0)) and completed requests
            const validRequests = requests.filter(
                request => request.buyer !== "0x0000000000000000000000000000000000000000"
            );
            
            
            // Filter out completed purchases and rejected requests
            // Get completed purchases from localStorage
            const completedPurchases = JSON.parse(localStorage.getItem('farmerCompletedPurchases') || '[]');
            const completedPairs = JSON.parse(localStorage.getItem('farmerCompletedPairs') || '[]');
            
            const activeRequests = validRequests.filter(request => {
                // Filter out rejected requests (status = 2)
                const isRejected = request.status.toString() === "2";
                
                // Filter out completed purchases (those that have been paid for)
                let isCompleted = completedPurchases.includes(request.requestId.toString());
                // Also filter if we have a buyer|cropID match from events
                if (!isCompleted) {
                    const key = `${(request.buyer||'').toLowerCase()}|${request.cropID?.toString?.() || request.cropId?.toString?.()}`;
                    if (key && completedPairs.includes(key)) {
                        isCompleted = true;
                    }
                }
                
                if (isRejected) {
                    
                }
                
                if (isCompleted) {
                    
                }
                
                return !isRejected && !isCompleted;
            });
            
            
            
            // Get Web3 instance to convert prices
            const web3Instance = window.web3 || web3;
            
            // Enrich the requests with crop names and buyer names
            let enrichedRequests = await Promise.all(
                activeRequests.map(async (request) => {
                    try {
                        // Resolve crop id safely and map to local crop details
                        const reqCropId = (request.cropID?.toString?.() || request.cropId?.toString?.() || '').toString();
                        // Get crop details from local crops list
                        let cropName = reqCropId ? `Crop #${reqCropId}` : 'Crop';
                        const localCrop = crops.find(crop => crop?.cropID?.toString?.() === reqCropId);
                        if (localCrop) {
                            cropName = localCrop.cropName;
                        }
                        
                        const buyerName = await getBuyerName(request.buyer);
                
                        // Convert prices to ether for display with robust fallbacks
                        let priceInEther = '0';
                        try {
                            const rawWei = (request.price ?? request.priceWei ?? request.basePrice ?? '0').toString();
                            if (rawWei && rawWei !== '0') {
                                priceInEther = web3Instance.utils.fromWei(rawWei, 'ether');
                            }
                        } catch (_) {}
                        // Fallback: use local crop price or on-chain crop price if request.price is missing/zero
                        if (!priceInEther || isNaN(parseFloat(priceInEther)) || parseFloat(priceInEther) === 0) {
                            try {
                                // Try local crop object first
                                if (localCrop && localCrop.price) {
                                    priceInEther = web3Instance.utils.fromWei(localCrop.price.toString(), 'ether');
                                } else {
                                    const cropOnChain = await contract.methods.getCrop(reqCropId).call({ from: localAccount });
                                    if (cropOnChain && cropOnChain.price) {
                                        priceInEther = web3Instance.utils.fromWei(cropOnChain.price.toString(), 'ether');
                                    }
                                }
                            } catch (e) {
                                console.warn('Could not resolve price for request', request.requestId?.toString?.(), e);
                            }
                        }

                        // Assign the resolved price back to the request object for display
                        request.priceInEther = priceInEther;
                        
                        // Get any custom bid information from localStorage
                        const bidInfo = getBidForRequest(request.requestId);
                        
                        // Set flag if this request has a custom bid
                        const hasBid = bidInfo !== null;
                        
                        // Store the bid price for display (either from localStorage or contract)
                        let bidPriceInEther = null;
                        
                        if (hasBid && bidInfo) {
                            // Use the stored bid price
                            bidPriceInEther = bidInfo.bidPrice;
                        }
                        
                        // Calculate price difference as percentage if bid exists
                        let priceDiffPercentage = 0;
                        if (hasBid && bidPriceInEther) {
                            const originalPrice = parseFloat(priceInEther);
                            const bidPrice = parseFloat(bidPriceInEther);
                            
                            if (originalPrice > 0) {
                                // Calculate percentage difference ((bid - original) / original) * 100
                                priceDiffPercentage = ((bidPrice - originalPrice) / originalPrice) * 100;
                            }
                        }
                        
                        let statusText;
                        switch(request.status.toString()) {
                            case "0":
                                statusText = "Pending";
                                break;
                            case "1":
                                statusText = "Accepted";
                                break;
                            case "2":
                                statusText = "Rejected";
                                break;
                            default:
                                statusText = "Unknown";
                        }
                        
                        return {
                    ...request,
                    cropName,
                    buyerName,
                            priceInEther,
                    statusText,
                            hasBid,
                            bidPriceInEther,
                            priceDiffPercentage,
                            // Ensure status is properly stored as both number and string for comparison
                            status: request.status,
                            statusString: request.status.toString()
                        };
                    } catch (error) {
                        console.error("Error processing request:", error);
                        return request;
                    }
                })
            );
            // If nothing after RPC + filters, try events-only fallback for visibility
            if (!enrichedRequests || enrichedRequests.length === 0) {
                try {
                    const web3Instance = window.web3 || web3;
                    if (web3Instance?.eth?.getBlockNumber) {
                        const events = await contract.getPastEvents('PurchaseRequested', {
                            fromBlock: 0,
                            toBlock: 'latest'
                        });
                        const farmerAddr = (localAccount || '').toLowerCase();
                        const eventRequests = events
                            .map(ev => ev.returnValues || {})
                            .filter(rv => (rv.farmer || '').toLowerCase() === farmerAddr)
                            .map(rv => ({
                                requestId: (rv.requestId || '').toString(),
                                cropID: rv.cropID,
                                quantity: rv.quantity,
                                buyer: rv.buyer,
                                farmer: rv.farmer,
                                price: '0',
                                status: '0',
                                message: '',
                                timestamp: Date.now().toString()
                            }));
                        enrichedRequests = await Promise.all(
                            eventRequests.map(async (request) => {
                                try {
                                    let cropName = `Crop #${request.cropID}`;
                                    const localCrop = crops.find(c => c.cropID?.toString() === request.cropID?.toString());
                                    if (localCrop) cropName = localCrop.cropName;
                                    const buyerName = await getBuyerName(request.buyer);
                                    const priceInEther = web3Instance.utils.fromWei(request.price || '0', 'ether');
                                    return {
                                        ...request,
                                        cropName,
                                        buyerName,
                                        priceInEther,
                                        statusText: 'Pending',
                                        hasBid: false,
                                        bidPriceInEther: null,
                                        priceDiffPercentage: 0,
                                        status: request.status,
                                        statusString: '0'
                                    };
                                } catch (_) {
                                    return request;
                                }
                            })
                        );
                    }
                } catch (_) {}
            }
            
            
            // Check for new requests by comparing with previous state
            if (purchaseRequests && purchaseRequests.length > 0) {
                const newRequestIds = enrichedRequests.map(req => req.requestId.toString());
                const oldRequestIds = purchaseRequests.map(req => req.requestId.toString());
                
                const hasNewRequests = newRequestIds.some(id => !oldRequestIds.includes(id));
                if (hasNewRequests) {
                    
                    setHasNewRequests(true);
                    
                    // Show notification
                    setSnackbar({
                        open: true,
                        message: "New purchase requests received!",
                        severity: "info",
                        duration: 5000
                    });
                }
            } else if (enrichedRequests.length > 0) {
                // First time loading requests
                setHasNewRequests(true);
            }
            
            setPurchaseRequests(enrichedRequests);
        } catch (error) {
            console.error("Error fetching purchase requests:", error);
            setSnackbar({
                open: true,
                message: "Error fetching purchase requests. Please try again.",
                severity: 'error'
            });
        }
    };

    // Function to get buyer's display name
    const getBuyerName = async (buyerAddress) => {
        try {
            return await getUserDisplayName(buyerAddress);
        } catch (error) {
            console.error("Error getting buyer name:", error);
            return buyerAddress.substring(0, 6) + '...' + buyerAddress.substring(buyerAddress.length - 4);
        }
    };

    // Function to fetch orders from the contract
    const fetchOrders = async () => {
        try {
            if (!contract || !contract.methods) {
                console.error("Contract not initialized in fetchOrders");
                return;
            }

            
            
            // Strategy: Prefer reading on-chain events that are accessible over RPC (eth_getLogs)
            // to derive paid orders. This works without requiring buyer-only functions.
            let pendingDeliveries = [];
            try {
                // Primary (may revert with "Only buyers allowed")
                pendingDeliveries = await contract.methods.getPendingDeliveries().call({from: localAccount});
                
            } catch (error) {
                
                try {
                    // Fetch all CropBought events for this farmer
                    const cropBoughtEvents = await contract.getPastEvents('CropBought', {
                        filter: { farmer: localAccount },
                        fromBlock: 0,
                        toBlock: 'latest'
                    });
                    
                    // Build a compact completed set for filtering requests elsewhere
                    const completedPairs = [];
                    pendingDeliveries = (cropBoughtEvents || []).map((ev) => {
                        const rv = ev.returnValues || {};
                        const buyer = rv.buyer;
                        const cropID = rv.cropID;
                        const quantity = rv.quantity;
                        const amountHeld = rv.amountHeld;
                        const txHash = ev.transactionHash;
                        // Store buyer|cropID to help filter accepted requests from the requests tab
                        if (buyer && cropID !== undefined) {
                            completedPairs.push(`${buyer.toLowerCase()}|${cropID.toString()}`);
                        }
                        return {
                            cropID,
                            quantity,
                            buyer,
                            farmer: localAccount,
                            amountHeld,
                            delivered: false,
                            // Use tx hash as a stable identifier if requestId isn't directly available
                            requestId: txHash
                        };
                    });
                    // Persist for cross-function filtering
                    if (completedPairs.length > 0) {
                        localStorage.setItem('farmerCompletedPairs', JSON.stringify(completedPairs));
                    }
                } catch (eventsError) {
                    console.error("Failed to derive orders from events:", eventsError);
                }
            }
            
            // Get Web3 instance to convert prices
            const web3Instance = window.web3 || web3;
            
            // Process pending deliveries (or event-derived paid orders) as active orders
            const processedActiveOrders = await Promise.all(
                pendingDeliveries.map(async (delivery) => {
                    try {
                        // Get crop details from local crops list or contract
                        let cropName = `Crop #${delivery.cropID}`;
                        const localCrop = crops.find(crop => crop.cropID.toString() === delivery.cropID.toString());
                        if (localCrop) {
                            cropName = localCrop.cropName;
                        } else {
                            // Try to get crop name from contract if not available locally
                            try {
                                // This assumes your contract has a way to get crop details by ID
                                // You might need to adjust this based on your actual contract structure
                                const cropDetails = await contract.methods.getCrop(delivery.cropID).call({from: localAccount});
                                if (cropDetails && cropDetails.cropName) {
                                    cropName = cropDetails.cropName;
                                }
                            } catch (error) {
                                
                            }
                        }
                        
                        // Get buyer name
                        const buyerName = await getBuyerName(delivery.buyer);
                        
                        // Convert price from wei to ether
                        const paymentAmount = web3Instance ? web3Instance.utils.fromWei(delivery.amountHeld.toString(), 'ether') : '0';
                        
                        return {
                            cropID: delivery.cropID,
                            quantity: delivery.quantity,
                            buyer: delivery.buyer,
                            farmer: localAccount,
                            amountHeld: delivery.amountHeld,
                            delivered: false,
                            cropName,
                            buyerName,
                            paymentAmount,
                            status: 'payment_received', // These are completed purchases ready for delivery
                            requestId: delivery.requestId
                        };
                    } catch (error) {
                        console.error("Error processing request:", error);
                        return null;
                    }
                })
            ).then(orders => orders.filter(order => order !== null));
            
            
            
            // Check for new orders by comparing with previous state
            if (activeOrders && activeOrders.length > 0) {
                const newOrderIds = processedActiveOrders.map(order => order.cropID.toString());
                const oldOrderIds = activeOrders.map(order => order.cropID.toString());
                
                const hasNewOrders = newOrderIds.some(id => !oldOrderIds.includes(id));
                if (hasNewOrders) {
                    
                    setHasNewOrders(true);
                    
                    // Show notification
                    setSnackbar({
                        open: true,
                        message: "New orders received! Check the Orders & Cultivation tab.",
                        severity: "info",
                        duration: 5000
                    });
                }
            } else if (processedActiveOrders.length > 0) {
                // First time loading orders
                setHasNewOrders(true);
            }
            
            setActiveOrders(processedActiveOrders);
            
            // Build completed orders list from DeliveryConfirmed events
            let processedCompletedOrders = [];
            try {
                const deliveredEvents = await contract.getPastEvents('DeliveryConfirmed', {
                    fromBlock: 0,
                    toBlock: 'latest'
                });
                const farmerAddr = (localAccount || '').toLowerCase();
                processedCompletedOrders = await Promise.all((deliveredEvents || [])
                    .filter(ev => (ev.returnValues?.farmer || '').toLowerCase() === farmerAddr)
                    .map(async (ev) => {
                        const rv = ev.returnValues || {};
                        const cropID = rv.cropID;
                        const buyer = rv.buyer;
                        const amountReleased = rv.amountReleased;
                        let cropName = `Crop #${cropID}`;
                        const localCrop = crops.find(c => c.cropID?.toString() === cropID?.toString());
                        if (localCrop) cropName = localCrop.cropName;
                        else {
                            try {
                                const cropDetails = await contract.methods.getCrop(cropID).call({from: localAccount});
                                if (cropDetails?.cropName) cropName = cropDetails.cropName;
                            } catch (_) {}
                        }
                        const buyerName = await getBuyerName(buyer);
                        const paymentAmount = (window.web3 || web3)?.utils?.fromWei(amountReleased?.toString() || '0', 'ether') || '0';
                        let deliveryDate = '';
                        try {
                            const blk = await (window.web3 || web3).eth.getBlock(ev.blockNumber);
                            if (blk?.timestamp) {
                                const d = new Date(Number(blk.timestamp) * 1000);
                                deliveryDate = d.toLocaleDateString();
                            }
                        } catch (_) {}
                        return {
                            cropID,
                            quantity: 'N/A',
                            buyer,
                            buyerName,
                            farmer: localAccount,
                            paymentAmount,
                            cropName,
                            deliveryDate,
                            status: 'delivered'
                        };
                    }));
            } catch (_) {}

            setCompletedOrders(processedCompletedOrders);
            
        } catch (error) {
            console.error("Error fetching orders:", error);
            setSnackbar({
                open: true,
                message: "Error fetching orders. Please try again.",
                severity: 'error'
            });
        }
    };

    // Function to confirm delivery
    const handleConfirmDelivery = async (cropID) => {
        try {
            setLoading(true);
            
            
            
            // Since we can't actually confirm delivery without the buyer completing the purchase,
            // we'll show a message explaining the current status
            const order = activeOrders.find(order => order.cropID.toString() === cropID.toString());
            
            if (order && order.status === 'pending_payment') {
                setSnackbar({
                    open: true,
                    message: "Cannot confirm delivery yet. The buyer needs to complete payment first.",
                    severity: 'warning'
                });
                return;
            }
            
            if (order && order.status === 'payment_received') {
                
            }
            
            // If payment has been received, we can proceed with delivery confirmation
            try {
                // Call the contract function to confirm delivery
                const tx = await contract.methods.confirmDelivery(cropID).send({
                    from: localAccount
                });
                
                
                
                setSnackbar({
                    open: true,
                    message: "Delivery confirmed successfully! Payment has been released to you.",
                    severity: 'success'
                });
                
                // Move the order to completed orders
                const completedOrder = activeOrders.find(order => order.cropID.toString() === cropID.toString());
                if (completedOrder) {
                    const orderWithDeliveryDate = {
                        ...completedOrder,
                        deliveryDate: new Date().toLocaleDateString(),
                        status: 'delivered'
                    };
                    
                    setCompletedOrders(prev => [orderWithDeliveryDate, ...prev]);
                    
                    // Remove from active orders
                    setActiveOrders(prev => prev.filter(order => order.cropID.toString() !== cropID.toString()));
                }
                
                // Refresh orders and purchase requests
                await fetchOrders();
                await fetchPurchaseRequests();
                
            } catch (error) {
                console.error("Error confirming delivery:", error);
                setSnackbar({
                    open: true,
                    message: `Error confirming delivery: ${error.message}`,
                    severity: 'error'
                });
            }
            
        } catch (error) {
            console.error("Error in handleConfirmDelivery:", error);
            setSnackbar({
                open: true,
                message: `Error: ${error.message}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Function to view order details
    const handleViewOrderDetails = (order) => {
        // For now, just show an alert with order details
        // In the future, you can implement a detailed modal
        const statusText = "Payment received, ready for delivery";
        const actionText = "Payment has been received! You can now deliver the crop and ask the buyer to confirm delivery.";
        
        alert(`Request Details:\n\n` +
              `Request ID: ${order.requestId}\n` +
              `Crop: ${order.cropName}\n` +
              `Quantity: ${order.quantity} kg\n` +
              `Buyer: ${order.buyerName || order.buyer}\n` +
              `Expected Payment: ${order.paymentAmount} ETH\n` +
              `Status: ${statusText}\n\n` +
              `Next Steps:\n${actionText}`);
    };

    // Soft-mark an order as delivered so the buyer can see a "Confirm Delivery" prompt
    const markOrderAsDelivered = async (cropID) => {
        try {
            // Persist locally so buyer UI can detect and prompt confirmation
            const deliveredKeys = JSON.parse(localStorage.getItem('farmerMarkedDelivered') || '[]');
            const key = cropID.toString();
            if (!deliveredKeys.includes(key)) {
                deliveredKeys.push(key);
                localStorage.setItem('farmerMarkedDelivered', JSON.stringify(deliveredKeys));
            }
            setSnackbar({
                open: true,
                message: 'Marked as delivered. Buyer can now confirm delivery from their My Purchases tab.',
                severity: 'info'
            });
        } catch (error) {
            console.error('Error marking delivered:', error);
            setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
        }
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setCropImage(file);
            
            // Create a preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setCropImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUpload = async () => {
        if (!cropImage) {
            setSnackbar({
                open: true,
                message: "Please select an image to upload.",
                severity: 'warning'
            });
            return;
        }

        setUploadingImage(true);
        try {
            // Compress the image before uploading if it's large
            const compressedImage = await compressImageIfNeeded(cropImage);
            
            
            const cid = await uploadImageToPinata(compressedImage || cropImage);
            
            
            setImageCID(cid);
            
            // Save the image in our direct image data cache too
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageData = reader.result;
                // Use a temporary ID until we generate the real cropID
                setDirectImageData(prev => ({
                    ...prev,
                    'temp-new-crop': imageData
                }));
            };
            reader.readAsDataURL(compressedImage || cropImage);
            
            setSnackbar({
                open: true,
                message: "Image uploaded successfully!",
                severity: 'success'
            });
        } catch (error) {
            console.error("Error uploading image:", error);
            setSnackbar({
                open: true,
                message: "Error uploading image. Please try again.",
                severity: 'error'
            });
        } finally {
            setUploadingImage(false);
        }
    };

    // Helper function to compress images if they're large
    const compressImageIfNeeded = async (file) => {
        // Skip compression for small files (< 1MB)
        if (file.size < 1024 * 1024) {
            
            return null;
        }
        
        
        
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    // Calculate new dimensions (maintain aspect ratio)
                    let width = img.width;
                    let height = img.height;
                    
                    // Max dimensions
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;
                    
                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to Blob
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            console.error("Failed to compress image");
                            resolve(null);
                            return;
                        }
                        
                        // Create a new File from the blob
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        
                        console.log(`Compressed image from ${(file.size / 1024).toFixed(2)}KB to ${(compressedFile.size / 1024).toFixed(2)}KB`);
                        resolve(compressedFile);
                    }, 'image/jpeg', 0.8); // 80% quality
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const addListing = async () => {
        if (!cropName || !price || !quantity || !cultivationDate) {
            setSnackbar({
                open: true,
                message: "Please fill in all fields",
                severity: 'warning'
            });
            return;
        }

        setLoading(true);
        try {
            // Upload image first if selected but not yet uploaded
            let finalImageCID = imageCID;
            if (cropImage && !imageCID) {
                try {
                    setUploadingImage(true);
                    console.log("Uploading image before creating listing...");
                    finalImageCID = await uploadImageToPinata(cropImage);
                    setImageCID(finalImageCID);
                    console.log("Image uploaded successfully with CID:", finalImageCID);
                } catch (imageError) {
                    console.error("Error auto-uploading image:", imageError);
                    setSnackbar({
                        open: true,
                        message: "Warning: Image upload failed, continuing without image",
                        severity: 'warning'
                    });
                    finalImageCID = "";
                } finally {
                    setUploadingImage(false);
                }
            }

            // Generate a unique crop ID based on timestamp and random number
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000);
            const generatedCropID = timestamp + random;
            
            console.log("Generated unique crop ID:", generatedCropID);

            // Convert price to wei
            const priceInWei = web3.utils.toWei(price, 'ether');
            
            // Format the date for the contract
            const dateObj = cultivationDate instanceof Date ? cultivationDate : new Date(cultivationDate);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Add the listing with image CID if available
            await contract.methods.addListing(
                cropName,
                priceInWei,
                generatedCropID,
                quantity,
                formattedDate,
                finalImageCID || "" // Use the image CID or empty string if not available
            ).send({
                from: localAccount
            });

            setSnackbar({
                open: true,
                message: `Crop listing added successfully! Crop ID: ${generatedCropID}`,
                severity: 'success'
            });

            // Reset form and close dialog
            resetForm();
            setShowAddDialog(false);

            // Refresh listings
            await fetchListings();
        } catch (error) {
            console.error("Error adding listing:", error);
            setSnackbar({
                open: true,
                message: "Error adding listing. Please try again.",
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const confirmDelivery = async (cropID) => {
        try {
            setLoading(true);
            const tx = await contract.confirmDelivery(cropID);
            await tx.wait();
            
            setSnackbar({
                open: true,
                message: "Delivery confirmed successfully!",
                severity: 'success'
            });
            
            // Refresh orders
            await fetchOrdersForFarmer();
        } catch (error) {
            console.error("Error confirming delivery:", error);
            setSnackbar({
                open: true,
                message: `Error confirming delivery: ${error.message}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Update the respond to purchase request function to handle bids and authorization errors
    const handleRespondToPurchaseRequest = async (requestId, accept) => {
        try {
            setLoading(true);
            
            // Get the request details from the purchaseRequests state
            const request = purchaseRequests.find(req => req.requestId.toString() === requestId.toString());
            
            if (!request) {
                throw new Error(`Request with ID ${requestId} not found`);
            }
            
            console.log(`${accept ? "Accepting" : "Rejecting"} purchase request:`, request);
            
            // Check if contract and methods are available
            if (!contract || !contract.methods) {
                console.error("Contract or contract methods not available");
                
                // Try to reinitialize the contract
                const newContract = await initializeContract();
                if (!newContract || !newContract.methods) {
                    throw new Error("Smart contract not initialized properly. Please refresh the page and try again.");
                }
                
                // Update local reference
                setContract(newContract);
            }
            
            // Make sure we're connected with the right account
            let currentAccount = localAccount;
            
            try {
                const accounts = await window.ethereum.request({ 
                    method: 'eth_accounts',
                    params: []
                });
                
                if (!accounts || accounts.length === 0) {
                    // This means MetaMask is logged out, try to reconnect
                    setSnackbar({
                        open: true,
                        message: "MetaMask session lost. Please reconnect to continue.",
                        severity: 'warning',
                        duration: 8000
                    });
                    
                    try {
                        console.log("Attempting to reconnect to MetaMask...");
                        const newAccounts = await window.ethereum.request({ 
                            method: 'eth_requestAccounts',
                            params: []
                        });
                        
                        if (!newAccounts || newAccounts.length === 0) {
                            throw new Error("Failed to connect to MetaMask");
                        }
                        
                        currentAccount = newAccounts[0];
                        setLocalAccount(newAccounts[0]);
                        localStorage.setItem('farmerAccount', newAccounts[0]);
                        
                        // Re-create contract instance with the new account
                        await initializeContract();
                        
                        console.log("Successfully reconnected to MetaMask with account:", currentAccount);
                    } catch (connectError) {
                        console.error("Failed to reconnect to MetaMask:", connectError);
                        throw new Error("Please connect to MetaMask to continue. Click the MetaMask extension and connect your account.");
                    }
                } else if (accounts[0] !== localAccount) {
                    // Account changed - update our state
                    console.log("Account changed from", localAccount, "to", accounts[0]);
                    currentAccount = accounts[0];
                    setLocalAccount(accounts[0]);
                    localStorage.setItem('farmerAccount', accounts[0]);
                }
            } catch (accountError) {
                console.error("Error checking MetaMask accounts:", accountError);
                
                // If this is a MetaMask error, provide a specific message
                if (accountError.code === 4100 || accountError.code === 4001) {
                    throw new Error("MetaMask requires authorization. Please open MetaMask and connect your account.");
                } else {
                    throw new Error("Error connecting to your wallet: " + accountError.message);
                }
            }
            
            console.log("Available contract methods:", Object.keys(contract.methods));
            
            // Debug to see what's in the contract methods
            if (!contract.methods.respondToPurchaseRequest) {
                console.error("respondToPurchaseRequest method not found in contract");
                
                // Try to find similar methods
                const methodNames = Object.keys(contract.methods);
                const similarMethods = methodNames.filter(name => 
                    name.toLowerCase().includes("request") || 
                    name.toLowerCase().includes("purchase") ||
                    name.toLowerCase().includes("respond") ||
                    name.toLowerCase().includes("accept")
                );
                
                console.log("Similar methods found:", similarMethods);
                
                if (similarMethods.length === 0) {
                    throw new Error("No request-related methods found in contract. Please refresh the page.");
                }
                
                // Try to reinstantiate the contract
                const refreshedContract = await initializeContract();
                if (!refreshedContract || !refreshedContract.methods.respondToPurchaseRequest) {
                    throw new Error("Contract methods missing after refresh. Please reload the page completely.");
                }
            }
            
            console.log(`Calling respondToPurchaseRequest with requestId=${requestId}, accept=${accept}`);
            
            // Check for gas estimation first to detect errors early
            let gasEstimate;
            try {
                gasEstimate = await contract.methods.respondToPurchaseRequest(
                    requestId,
                    accept
                ).estimateGas({from: currentAccount});
                
                console.log(`Gas estimate for transaction: ${gasEstimate}`);
            } catch (gasError) {
                console.error("Gas estimation error:", gasError);
                
                // Check for common gas estimation errors
                if (gasError.message.includes("execution reverted")) {
                    throw new Error("Transaction would fail: " + gasError.message);
                } else {
                    // Continue anyway, MetaMask will show the error
                    console.warn("Continuing despite gas estimation error");
                }
            }
            
            // Execute the transaction with proper error handling
            try {
                const tx = await contract.methods.respondToPurchaseRequest(
                    requestId,
                    accept
                ).send({
                    from: currentAccount,
                    gas: gasEstimate ? Math.floor(gasEstimate * 1.2) : undefined, // Add 20% buffer if we have an estimate
                });
                
                console.log("Transaction successful:", tx);
                
                setSnackbar({
                    open: true,
                    message: accept ? 
                        "Purchase request accepted. The buyer can now complete the purchase." : 
                        "Purchase request rejected.",
                    severity: accept ? 'success' : 'info'
                });
                
                // Update the local state to reflect the change
                setPurchaseRequests(prevRequests => 
                    prevRequests.map(req => 
                        req.requestId.toString() === requestId.toString() 
                            ? { ...req, status: accept ? 1 : 2, statusText: accept ? "Approved" : "Rejected" } 
                            : req
                    )
                );
            
            // If the request was accepted, it will eventually become an order
            // Refresh orders to check if it's already there
            if (accept) {
                setTimeout(() => {
                    fetchOrders();
                }, 1000);
            }
            } catch (txError) {
                console.error("Transaction error:", txError);
                
                // Check for different MetaMask error types
                if (txError.code === 4001) {
                    console.warn("User denied transaction in MetaMask");
                    setSnackbar({
                        open: true,
                        message: "Transaction was rejected in MetaMask. Please try again.",
                        severity: 'warning'
                    });
                    return; // This is user cancellation, not an error
                } else if (txError.code === -32603) {
                    console.error("MetaMask authorization error:", txError);
                    setSnackbar({
                        open: true,
                        message: "Transaction was not authorized. Please check MetaMask and try again.",
                        severity: 'error'
                    });
                } else {
                    throw txError;
                }
            }
            
            // Refresh purchase requests and orders after successful transaction
            await fetchPurchaseRequests();
            await fetchOrders();
        } catch (error) {
            console.error("Error in handleRespondToPurchaseRequest:", error);
            
            // Provide a friendly error message based on error type
            let errorMessage = error.message;
            if (error.message.includes("User denied")) {
                errorMessage = "You rejected the transaction in MetaMask. Try again when ready.";
            } else if (error.message.includes("insufficient funds")) {
                errorMessage = "You don't have enough ETH to complete this transaction. Please add funds to your wallet.";
            } else if (error.message.includes("nonce too low") || error.message.includes("already known")) {
                errorMessage = "Transaction already pending. Please check MetaMask for details."; 
            }
            
            setSnackbar({
                open: true,
                message: `Error: ${errorMessage}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setCropName("");
        setPrice("");
        setQuantity("");
        setCultivationDate("");
        setCropImage(null);
        setCropImagePreview(null);
        setImageCID("");
    };

    const handleOpenAddDialog = () => {
        resetForm();
        setShowAddDialog(true);
    };

    const handleCloseAddDialog = () => {
        setShowAddDialog(false);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        if (newValue === 1) {
            // If switching to the purchase requests tab, clear the notification indicator
            setHasNewRequests(false);
        } else if (newValue === 0) {
            // If switching to My Listings tab, refresh listings to ensure they're up to date
            fetchListings();
            // Clear the new bids indicator when viewing listings
            setHasNewBids(false);
        } else if (newValue === 2) {
            // If switching to Orders & Cultivation tab, refresh orders
            fetchOrders();
            // Clear the new orders notification when user views the tab
            if (hasNewOrders) {
                setHasNewOrders(false);
            }
        }
    };

    // ETH/INR formatting helpers
    const [ethInrRate, setEthInrRate] = useState(null);
    useEffect(() => {
        (async () => {
            const r = await getEthInrRate();
            setEthInrRate(r);
        })();
    }, []);
    // Helper: format wei to `ETH / INR`
    const formatEthPrice = (weiPrice) => {
        try {
            if (!web3 || !weiPrice) return '0 ETH';
            const eth = web3.utils.fromWei(weiPrice.toString(), 'ether');
            return formatEthInr(eth, ethInrRate);
        } catch (error) {
            return "0 ETH";
        }
    };

    // Helper function to get crop image URL with fallbacks - updated to prevent flickering
    const getCropImageUrl = (crop) => {
        if (!crop) return 'https://via.placeholder.com/300x200?text=No+Image';
        
        // If the crop has a valid CID, use the gateway URL
        if (crop.imageCID && crop.imageCID !== '') {
            return getIPFSGatewayURL(crop.imageCID);
        }
        
        // Return a default image if no CID is available
        return 'https://via.placeholder.com/300x200?text=No+Image';
    };

    // Function to fetch image directly if needed - updated to handle loading state
    const fetchDirectImageIfNeeded = async (cid, cropId) => {
        if (!cid || directImageData[cropId]) return;
        
        try {
            console.log(`Attempting to fetch image directly for crop ${cropId}...`);
            const imageData = await fetchIPFSImageDirectly(cid);
            if (imageData) {
                console.log(`Direct image fetch successful for crop ${cropId}`);
                setDirectImageData(prev => ({
                    ...prev,
                    [cropId]: imageData
                }));
            }
        } catch (error) {
            console.error(`Failed to fetch image directly for crop ${cropId}:`, error);
        } finally {
            // Update loading state once completed (success or failure)
            setLoadingImages(prev => ({
                ...prev,
                [cropId]: false
            }));
        }
    };

    // Handler for image errors with multiple fallback attempts - updated to prevent flickering
    const handleImageError = async (event, cropId, cid) => {
        if (!cid) {
            event.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
            return;
        }
        
        console.warn(`Image failed to load for crop ${cropId}, CID: ${cid}`);
        
        // Keep track of fallback attempts for this specific image
        const currentAttempt = fallbackAttempt[cropId] || 0;
        const nextAttempt = currentAttempt + 1;
        
        setFallbackAttempt({
            ...fallbackAttempt,
            [cropId]: nextAttempt
        });
        
        // Show loading skeleton while trying to recover the image
        setLoadingImages(prev => ({
            ...prev,
            [cropId]: true
        }));
        
        // Try different fallback options based on attempt number
        if (nextAttempt === 1) {
            // First fallback: Try IPFS.io gateway
            event.target.src = `https://ipfs.io/ipfs/${cid}?${Date.now()}`; // Add cache busting
        } else if (nextAttempt === 2) {
            // Second fallback: Try Cloudflare gateway
            event.target.src = `https://cloudflare-ipfs.com/ipfs/${cid}?${Date.now()}`; // Add cache busting
        } else if (nextAttempt === 3) {
            // Third fallback: Try dweb gateway
            event.target.src = `https://dweb.link/ipfs/${cid}?${Date.now()}`; // Add cache busting
        
            // Fourth/Fifth fallback: Try direct fetch with our enhanced method
            try {
                const imageData = await fetchIPFSImageDirectly(cid);
                if (imageData) {
                    console.log(`Direct image fetch successful for crop ${cropId} after multiple errors`);
                    setDirectImageData(prev => ({
                        ...prev,
                        [cropId]: imageData
                    }));
                    event.target.src = imageData;
                    return;
                }
                // If direct fetch fails, try Infura gateway as last resort
                event.target.src = `https://ipfs.infura.io/ipfs/${cid}?${Date.now()}`; // Add cache busting
            } catch (error) {
                console.error(`Failed to fetch image directly for crop ${cropId} after errors:`, error);
                event.target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
            }
        } else {
            // Final fallback: Use placeholder
            console.error(`All image loading attempts failed for crop ${cropId}, CID: ${cid}`);
            event.target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
        }
        
        // Update loading state after attempting fallback
        setTimeout(() => {
            setLoadingImages(prev => ({
                ...prev,
                [cropId]: false
            }));
        }, 1000); // Small delay to allow image to potentially load
    };

    // Handler for image load events
    const handleImageLoad = (cropId) => {
        setLoadingImages(prev => ({
            ...prev,
            [cropId]: false
        }));
    };

    // Function to get removed crop IDs from localStorage
    const getRemovedCropIdsFromLocalStorage = () => {
        try {
            const stored = localStorage.getItem('removedCrops');
            if (!stored) return [];
            
            const parsed = JSON.parse(stored);
            
            // Handle both array and object formats for compatibility
            if (Array.isArray(parsed)) {
                return parsed;
            } else if (typeof parsed === 'object') {
                return Object.keys(parsed);
            }
            
            return [];
        } catch (error) {
            console.error("Error parsing removed crops from localStorage:", error);
            return [];
        }
    };

    // Function to notify other components about removed crops
    const notifyRemovedCrop = (cropId) => {
        try {
            // Create a custom event that components can listen for
            const event = new CustomEvent('cropRemoved', { 
                detail: { 
                    cropId,
                    timestamp: new Date().getTime()
                } 
            });
            
            // Dispatch the event globally
            window.dispatchEvent(event);
            console.log(`Dispatched cropRemoved event for crop ID ${cropId}`);
            
            // Also trigger a storage event for cross-tab communication
            // We do this by updating localStorage in a way that triggers the event
            const currentValue = localStorage.getItem('removedCrops');
            localStorage.setItem('removedCrops_temp', currentValue || '[]');
            localStorage.removeItem('removedCrops_temp');
        } catch (error) {
            console.error("Error dispatching crop removed event:", error);
        }
    };

    // Function to remove a crop from the listings
    const removeCrop = async (cropId) => {
        try {
            setLoading(true);
            
            // Find the crop in our local state
            const crop = crops.find(c => c.cropID.toString() === cropId.toString());
            if (!crop) {
                throw new Error("Crop not found");
            }
            
            console.log(`Removing crop ${cropId} (${crop.cropName}) by setting quantity to zero...`);
            
            // Since there is no removeCrop function in the contract, we'll update the listing
            // with zero quantity to effectively remove it from availability
            
            // Add listing with same details but zero quantity
            const result = await contract.methods.addListing(
                crop.cropName,
                crop.price,
                cropId,
                "0", // Set quantity to zero
                crop.deliveryDate,
                crop.imageCID || ""
            ).send({
                from: localAccount
            });
            
            console.log("Transaction result:", result);
            
            // Get current removed crop IDs
            const currentRemovedCropIds = getRemovedCropIdsFromLocalStorage();
            
            // Add this crop ID if not already in the list
            if (!currentRemovedCropIds.includes(cropId.toString())) {
                const updatedRemovedCropIds = [...currentRemovedCropIds, cropId.toString()];
                
                // Save to localStorage for persistence across page refreshes
                localStorage.setItem('removedCrops', JSON.stringify(updatedRemovedCropIds));
                console.log("Updated removed crops in localStorage:", updatedRemovedCropIds);
                
                // Update local state
                setRemovedCropIds(updatedRemovedCropIds);
                
                // Notify other components about the removed crop
                notifyRemovedCrop(cropId.toString());
            }
            
            // Remove this crop from the current crops state
            setCrops(currentCrops => 
                currentCrops.filter(c => c.cropID.toString() !== cropId.toString())
            );
            
            setSnackbar({
                open: true,
                message: `${crop.cropName} has been permanently removed from your listings`,
                severity: 'success'
            });
            
            // Close confirmation dialog
            setConfirmDialog({
                open: false,
                cropId: null,
                cropName: ''
            });
            
            // Refresh listings to get the updated data from the contract
            await fetchListings();
        } catch (error) {
            console.error("Error removing crop:", error);
            setSnackbar({
                open: true,
                message: `Failed to remove crop: ${error.message}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };
    
    // Handle opening the confirmation dialog
    const handleOpenConfirmDialog = (cropId, cropName) => {
        setConfirmDialog({
            open: true,
            cropId,
            cropName
        });
    };
    
    // Handle closing the confirmation dialog
    const handleCloseConfirmDialog = () => {
        setConfirmDialog({
            open: false,
            cropId: null,
            cropName: ''
        });
    };

    // Debug function to verify the filtering of removed crops
    const debugCropFiltering = () => {
        console.log("Debugging crop filtering:");
        console.log("Total crops in state:", crops.length);
        console.log("Removed crop IDs tracked:", removedCropIds);
        
        // Load from localStorage for verification
        try {
            const storedRemovedCrops = localStorage.getItem('removedCrops');
            if (storedRemovedCrops) {
                console.log("Removed crops in localStorage:", JSON.parse(storedRemovedCrops));
            } else {
                console.log("No removed crops found in localStorage");
            }
        } catch (error) {
            console.error("Error reading localStorage:", error);
        }
        
        return null; // Return null so it doesn't affect rendering
    };

    // Debug helper function to force sync removed crops
    const forceSyncRemovedCrops = () => {
        try {
            // Get the current removed crop IDs
            const removedIds = getRemovedCropIdsFromLocalStorage();
            console.log("Current removed crop IDs:", removedIds);
            
            // Ensure localStorage is up to date
            localStorage.setItem('removedCrops', JSON.stringify(removedIds));
            
            // Dispatch events for each removed crop to ensure all components are in sync
            removedIds.forEach(cropId => {
                notifyRemovedCrop(cropId);
            });
            
            setSnackbar({
                open: true,
                message: `Force synced ${removedIds.length} removed crops`,
                severity: 'success'
            });
        } catch (error) {
            console.error("Error force syncing removed crops:", error);
            setSnackbar({
                open: true,
                message: `Error syncing removed crops: ${error.message}`,
                severity: 'error'
            });
        }
    };

    // Add a function to sort purchase requests
    const getSortedRequests = () => {
        if (!purchaseRequests || purchaseRequests.length === 0) {
            return [];
        }
        
        // Create a copy to avoid mutating the original array
        const sortedRequests = [...purchaseRequests];
        
        switch (sortBy) {
            case 'bidDesc':
                // Sort by bid price, highest first (bids at top, then non-bids)
                return sortedRequests.sort((a, b) => {
                    // If both have bids, compare bid prices
                    if (a.hasBid && b.hasBid) {
                        return parseFloat(b.bidPriceInEther) - parseFloat(a.bidPriceInEther);
                    }
                    // If only a has bid, a comes first
                    if (a.hasBid) return -1;
                    // If only b has bid, b comes first
                    if (b.hasBid) return 1;
                    // If neither has bid, sort by original price
                    return parseFloat(b.priceInEther) - parseFloat(a.priceInEther);
                });
            case 'bidAsc':
                // Sort by bid price, lowest first
                return sortedRequests.sort((a, b) => {
                    if (a.hasBid && b.hasBid) {
                        return parseFloat(a.bidPriceInEther) - parseFloat(b.bidPriceInEther);
                    }
                    if (a.hasBid) return -1; // Still put bids first
                    if (b.hasBid) return 1;
                    return parseFloat(a.priceInEther) - parseFloat(b.priceInEther);
                });
            case 'percentDesc':
                // Sort by percentage difference, highest first
                return sortedRequests.sort((a, b) => {
                    if (a.hasBid && b.hasBid) {
                        return b.priceDiffPercentage - a.priceDiffPercentage;
                    }
                    if (a.hasBid) return -1;
                    if (b.hasBid) return 1;
                    return 0; // No difference for non-bids
                });
            case 'dateAsc':
                // Sort by request ID (proxy for date), oldest first
                return sortedRequests.sort((a, b) => 
                    parseInt(a.requestId.toString()) - parseInt(b.requestId.toString())
                );
            case 'dateDesc':
            default:
                // Sort by request ID (proxy for date), newest first
                return sortedRequests.sort((a, b) => 
                    parseInt(b.requestId.toString()) - parseInt(a.requestId.toString())
                );
        }
    };

    // Function to open the bid details dialog for a crop with proper bid amount handling
    const handleViewBidsForCrop = async (cropId, cropName) => {
        try {
            setLoading(true);
            console.log(`Fetching bids for crop ${cropId} (${cropName})`);
            
            // Find all purchase requests related to this crop
            const relatedRequests = purchaseRequests.filter(
                request => request.cropID.toString() === cropId.toString() && 
                request.status.toString() === "0" // Only show pending requests
            );
            
            console.log("Found related requests:", relatedRequests);
            
            // Process the requests to get bid information with better logging
            const bidsInfo = relatedRequests.map(request => {
                // Get custom bid information if available
                const bidInfo = getBidForRequest(request.requestId);
                
                // Check if this is a bid with custom price
                const hasBid = bidInfo !== null;
                
                // Get the bid price from the bidInfo if available, or use bidPriceInEther from the request
                // This ensures we use the actual bid value entered by the buyer
                let bidPrice = null;
                let bidPriceWei = null;
                
                if (hasBid && bidInfo && bidInfo.bidPrice) {
                    // Use price from stored bid info
                    bidPrice = bidInfo.bidPrice;
                    bidPriceWei = bidInfo.bidPriceWei;
                } else if (request.bidPriceInEther) {
                    // Use price from the request itself if available (this is the price entered by buyer)
                    bidPrice = request.bidPriceInEther;
                    bidPriceWei = null;  // We don't have the Wei value in this case
                }
                
                console.log(`Processing request ${request.requestId}:`, {
                    basePrice: request.priceInEther,
                    hasBid: hasBid,
                    bidInfo: bidInfo,
                    bidPrice: bidPrice,
                    bidPriceInEther: request.bidPriceInEther
                });
                
                return {
                    requestId: request.requestId.toString(),
                    buyerId: request.buyer,
                    buyerName: request.buyerName || "Anonymous Buyer",
                    // Anonymize the buyer address
                    anonymousBuyerId: `Buyer_${request.buyer.substring(2, 6)}`,
                    quantity: request.quantity.toString(),
                    basePrice: request.priceInEther || '0',
                    hasBid: hasBid || (request.bidPriceInEther ? true : false), // Consider it a bid if we have a bidPriceInEther
                    bidPrice: bidPrice || request.bidPriceInEther || null, // Use the processed bidPrice or the bidPriceInEther from request
                    bidPriceWei: bidPriceWei,
                    priceDiffPercentage: request.priceDiffPercentage || 0,
                    timestamp: request.timestamp || Date.now()
                };
            });
            
            console.log("Processed bids info:", bidsInfo);
            
            // Sort bids by price (highest first) with proper null checking
            const sortedBids = bidsInfo.sort((a, b) => {
                const priceA = a.hasBid && a.bidPrice ? parseFloat(a.bidPrice) : parseFloat(a.basePrice || 0);
                const priceB = b.hasBid && b.bidPrice ? parseFloat(b.bidPrice) : parseFloat(b.basePrice || 0);
                return priceB - priceA;
            });
            
            console.log("Sorted bids:", sortedBids);
            
            // Open the dialog with bid information
            setBidDetailsDialog({
                open: true,
                cropId,
                cropName,
                bids: sortedBids
            });
        } catch (error) {
            console.error("Error fetching bids for crop:", error);
            setSnackbar({
                open: true,
                message: `Error fetching bids: ${error.message}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Function to close the bid details dialog
    const handleCloseBidDetailsDialog = () => {
        setBidDetailsDialog({
            ...bidDetailsDialog,
            open: false
        });
    };

    // Add function to check MetaMask connection before accepting bids
    const checkMetaMaskAndAcceptBid = async (bidInfo) => {
        try {
            // First check if MetaMask is installed
            if (!window.ethereum) {
                setSnackbar({
                    open: true,
                    message: "MetaMask is not installed. Please install MetaMask to continue.",
                    severity: 'error'
                });
                return;
            }
            
            // Check if MetaMask is connected
            let accounts = await window.ethereum.request({ 
                method: 'eth_accounts',
                params: []
            });
            
            if (!accounts || accounts.length === 0) {
                // Not connected, try to connect
                console.log("MetaMask not connected. Requesting connection...");
                
                try {
                    // Show a user-friendly message before attempting connection
                    setSnackbar({
                        open: true,
                        message: "Please connect to MetaMask when prompted to accept this bid",
                        severity: 'info',
                        duration: 6000
                    });
                    
                    const newAccounts = await window.ethereum.request({ 
                        method: 'eth_requestAccounts',
                        params: []
                    });
                    
                    if (!newAccounts || newAccounts.length === 0) {
                        throw new Error("Failed to connect to MetaMask");
                    }
                    
                    accounts = newAccounts;
                    
                    // If account changed, update local state
                    if (newAccounts[0] !== localAccount) {
                        setLocalAccount(newAccounts[0]);
                        localStorage.setItem('farmerAccount', newAccounts[0]);
                        
                        // Allow time for state update and show success message
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        setSnackbar({
                            open: true,
                            message: "Successfully connected to MetaMask",
                            severity: 'success',
                            duration: 3000
                        });
                    }
                } catch (connectError) {
                    console.error("Error connecting to MetaMask:", connectError);
                    
                    // Check if this was a user rejection
                    if (connectError.code === 4001) {
                        setSnackbar({
                            open: true,
                            message: "MetaMask connection was rejected. Please try again.",
                            severity: 'warning'
                        });
                    } else {
                        setSnackbar({
                            open: true,
                            message: "Could not connect to MetaMask. Please try again.",
                            severity: 'error'
                        });
                    }
                    return;
                }
            }
            
            // Verify we're connected with the right account
            const currentAccount = accounts[0];
            console.log("Connected with account:", currentAccount);
            
            // Check if we need to reinitialize the contract or refresh data
            if (currentAccount !== localAccount) {
                // Account has changed, update state
                setLocalAccount(currentAccount);
                localStorage.setItem('farmerAccount', currentAccount);
                
                // Reinitialize contract with new account
                await initializeContract();
                
                // Refresh data with the new account
                await fetchPurchaseRequests();
                
                // Give time for data to refresh
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            // Get the full request info
            const request = purchaseRequests.find(req => req.requestId.toString() === bidInfo.requestId.toString());
            if (!request) {
                throw new Error(`Request with ID ${bidInfo.requestId} not found`);
            }
            
            // If this is a custom bid with a bidPrice, ask for confirmation
            if (bidInfo.hasBid && bidInfo.bidPrice) {
                // Close the dialog if open
                if (bidDetailsDialog.open) {
                    handleCloseBidDetailsDialog();
                }
                
                // Show confirmation dialog with custom price
                if (!window.confirm(`Accept this purchase request at the custom bid price of ${bidInfo.bidPrice} ETH?`)) {
                    console.log("User cancelled custom price acceptance");
                    return;
                }
                
                console.log(`Accepting request with custom bid price of ${bidInfo.bidPrice} ETH`);
            } else {
                // Close the dialog if open
                if (bidDetailsDialog.open) {
                    handleCloseBidDetailsDialog();
                }
            }
            
            // Show a message that we're processing the transaction
            setSnackbar({
                open: true,
                message: "Processing transaction. Please confirm in MetaMask...",
                severity: 'info',
                duration: 15000
            });
            
            // Accept the bid
            await handleRespondToPurchaseRequest(bidInfo.requestId, true);
            
            // After successfully accepting the request, create a record in localStorage to remember the custom price
            if (bidInfo.hasBid && bidInfo.bidPrice && bidInfo.bidPriceWei) {
                try {
                    const acceptedCustomBids = JSON.parse(localStorage.getItem('acceptedCustomBids') || '{}');
                    
                    // Store the accepted bid details
                    acceptedCustomBids[bidInfo.requestId] = {
                        requestId: bidInfo.requestId,
                        originalPrice: request.priceInEther,
                        originalPriceWei: request.price,
                        customPrice: bidInfo.bidPrice,
                        customPriceWei: bidInfo.bidPriceWei,
                        timestamp: Date.now()
                    };
                    
                    localStorage.setItem('acceptedCustomBids', JSON.stringify(acceptedCustomBids));
                    console.log(`Stored accepted custom bid for request ${bidInfo.requestId} in localStorage`);
                    
                    // Show success message with custom price
                    setSnackbar({
                        open: true,
                        message: `Purchase request accepted at custom bid price of ${bidInfo.bidPrice} ETH!`,
                        severity: 'success'
                    });
                } catch (error) {
                    console.error("Error storing accepted custom bid in localStorage:", error);
                }
            }
        } catch (error) {
            console.error("Error in MetaMask connection check:", error);
            setSnackbar({
                open: true,
                message: `Connection error: ${error.message}`,
                severity: 'error'
            });
        }
    };

    // Function to accept a bid directly from the bid details dialog
    const handleAcceptBidFromDialog = (bidInfo) => {
        // Use the MetaMask check function instead of directly calling accept
        checkMetaMaskAndAcceptBid(bidInfo);
    };

    // Function to check if a crop has any bids
    const hasBidsForCrop = (cropId) => {
        if (!purchaseRequests || purchaseRequests.length === 0) return false;
        
        // Check if there are any pending purchase requests for this crop with bids
        const hasBids = purchaseRequests.some(request => 
            request.cropID.toString() === cropId.toString() && 
            request.status.toString() === "0" && // Pending requests only
            request.hasBid // Has a custom bid
        );
        
        return hasBids;
    };

    // Add a function to count bids for a crop
    const countBidsForCrop = (cropId) => {
        if (!purchaseRequests || purchaseRequests.length === 0) return 0;
        
        // Count pending purchase requests for this crop
        return purchaseRequests.filter(request => 
            request.cropID.toString() === cropId.toString() && 
            request.status.toString() === "0" // Pending requests only
        ).length;
    };

    // Add a function to count custom bids for a crop (bids with custom price)
    const countCustomBidsForCrop = (cropId) => {
        if (!purchaseRequests || purchaseRequests.length === 0) return 0;
        
        // Count pending purchase requests with custom bids for this crop
        return purchaseRequests.filter(request => 
            request.cropID.toString() === cropId.toString() && 
            request.status.toString() === "0" && // Pending requests only
            request.hasBid // Has a custom bid
        ).length;
    };

    // Add a debug function to analyze and fix bid amounts
    const debugPurchaseRequestsAndBids = () => {
        try {
            console.log("==== DEBUG: PURCHASE REQUESTS ====");
            console.log("All purchase requests:", purchaseRequests);
            
            // Check localStorage for bid information
            const storedBids = JSON.parse(localStorage.getItem('cropBids') || '{}');
            console.log("==== DEBUG: STORED BIDS ====");
            console.log("Stored bids in localStorage:", storedBids);
            
            // Analyze each request for bid info
            if (purchaseRequests && purchaseRequests.length > 0) {
                console.log("==== DEBUG: ANALYZING REQUESTS ====");
                purchaseRequests.forEach(request => {
                    const requestId = request.requestId?.toString();
                    if (!requestId) {
                        console.log("Request missing ID:", request);
                        return;
                    }
                    
                    console.log(`Analyzing request ${requestId}:`);
                    console.log("- Base price:", request.priceInEther, "ETH");
                    console.log("- Buyer:", request.buyer);
                    
                    // Check if this has a bid
                    const bidInfo = getBidForRequest(requestId);
                    if (bidInfo) {
                        console.log("- Has bid:", true);
                        console.log("- Bid price:", bidInfo.bidPrice, "ETH");
                        console.log("- Bid price (wei):", bidInfo.bidPriceWei);
                    } else {
                        console.log("- Has bid:", false);
                        if (request.bidPriceInEther) {
                            console.log("- Request has bidPriceInEther:", request.bidPriceInEther, "ETH");
                        }
                    }
                    
                    console.log("- Full request data:", request);
                    console.log("------------------------");
                });
            }
        } catch (error) {
            console.error("Error in debug function:", error);
        }
    };

    // Call the debug function when viewing bids
    useEffect(() => {
        if (bidDetailsDialog.open) {
            debugPurchaseRequestsAndBids();
        }
    }, [bidDetailsDialog.open]);

    // Add a helper function to set debug bids for testing
    const setDebugBid = (requestId, bidPrice) => {
        try {
            console.log(`Setting debug bid of ${bidPrice} ETH for request ${requestId}`);
            
            const debugBids = JSON.parse(localStorage.getItem('debugBids') || '{}');
            
            // Create a fake bid object
            debugBids[requestId] = {
                requestId: requestId,
                bidPrice: bidPrice.toString(),
                bidPriceWei: window.web3.utils.toWei(bidPrice.toString(), 'ether'),
                timestamp: Date.now()
            };
            
            localStorage.setItem('debugBids', JSON.stringify(debugBids));
            console.log(`Set debug bid successfully:`, debugBids[requestId]);
            
            // Refresh purchase requests to show the new bid
            fetchPurchaseRequests();
            
            return true;
        } catch (error) {
            console.error(`Error setting debug bid:`, error);
            return false;
        }
    };

    // Call this function directly in the console for debugging:
    // Example: window.setDebugBid = setDebugBid;
    useEffect(() => {
        // Make the function available globally for debugging
        window.setDebugBid = setDebugBid;
    }, []);

    // Modify the acceptRequest function to add a notification about delivery
    const acceptRequest = async (requestId) => {
        try {
            setLoading(true);
            console.log(`Accepting request ${requestId}`);
            
            // Use respondToPurchaseRequest instead of direct contract call
            await handleRespondToPurchaseRequest(requestId, true);
            
            // After successful acceptance, show a notification with delivery instructions
            setSnackbar({
                open: true,
                message: "Purchase request accepted successfully. Prepare the crop for delivery!",
                severity: "success",
                duration: 6000
            });
            
            // Show a more detailed alert about next steps
            setTimeout(() => {
                alert("Request accepted! Next steps:\n\n" +
                      "1. Prepare the crop for delivery\n" +
                      "2. The buyer will now complete the purchase by paying\n" +
                      "3. Once payment is received, deliver the crop to the buyer\n" +
                      "4. The buyer will confirm delivery to release your payment\n\n" +
                      "You will be notified when payment is made.");
            }, 1000);
            
            // Store that this request was accepted to notify later about payment
            const acceptedRequests = JSON.parse(localStorage.getItem('farmerAcceptedRequests') || '[]');
            if (!acceptedRequests.includes(requestId.toString())) {
                acceptedRequests.push(requestId.toString());
                localStorage.setItem('farmerAcceptedRequests', JSON.stringify(acceptedRequests));
            }
            
            // Refresh the dashboard to update the UI
            fetchPurchaseRequests();
        } catch (error) {
            console.error("Error accepting request:", error);
            setSnackbar({
                open: true,
                message: `Error accepting request: ${error.message}`,
                severity: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    // Add a function to check if payments were made for accepted requests
    const checkForPayments = async () => {
        try {
            if (!contract || !account) return;
            
            console.log("Checking for payments on previously accepted requests...");
            
            // Get all accepted requests that we're tracking
            const acceptedRequestIds = JSON.parse(localStorage.getItem('farmerAcceptedRequests') || '[]');
            if (acceptedRequestIds.length === 0) {
                console.log("No accepted requests to check for payments");
                return;
            }
            
            console.log("Checking payments for these accepted request IDs:", acceptedRequestIds);
            
            // Since we can't call getPendingDeliveries(), we'll work with accepted requests
            // and check if any have been updated to indicate payment
            console.log("Cannot check for payments directly due to contract restrictions");
            console.log("Payments will be detected through contract events instead");
            
            // For now, we'll rely on the CropBought event to detect payments
            // This function will be updated when we have access to payment information
            
            // Get already notified payments from localStorage
            const notifiedPayments = JSON.parse(localStorage.getItem('farmerNotifiedPayments') || '[]');
            
            // We'll keep the existing logic for when we can access payment information
            // For now, just log that we're waiting for events
            console.log("Waiting for CropBought events to detect payments...");
            
            // Save updated notified payments to localStorage
            if (notifiedPayments.length > 0) {
                localStorage.setItem('farmerNotifiedPayments', JSON.stringify(notifiedPayments));
            }
            
            // Since we can't access payment information directly, we'll rely on events
            // The CropBought event will handle payment notifications
            console.log("Payment checking completed - relying on contract events for updates");
        } catch (error) {
            console.error("Error checking for payments:", error);
        }
    };

    // Call the check function periodically
    useEffect(() => {
        // Check for payments on initial load
        checkForPayments();
        
        // Set up interval to check periodically (every 30 seconds)
        const intervalId = setInterval(checkForPayments, 30000);
        
        return () => clearInterval(intervalId);
    }, [contract, account, web3]);

    // Add a function to check for confirmed deliveries and released payments
    const checkForConfirmedDeliveries = async () => {
        try {
            if (!contract || !account) return;
            
            console.log("Checking for confirmed deliveries...");
            
            // Get all deliveries
            const allDeliveries = await contract.methods.getPendingDeliveries().call({from: account});
            
            // Get already notified confirmed deliveries from localStorage
            const notifiedDeliveries = JSON.parse(localStorage.getItem('farmerNotifiedDeliveries') || '[]');
            
            // Filter for confirmed deliveries that are tied to this farmer and not yet notified
            for (const delivery of allDeliveries) {
                if (delivery.isDelivered && !notifiedDeliveries.includes(delivery.deliveryId.toString())) {
                    // Check if this is our delivery
                    try {
                        const request = await contract.methods.getSingleRequest(delivery.requestId).call({from: account});
                        
                        // If this farmer is the seller
                        if (request.seller.toLowerCase() === account.toLowerCase()) {
                            console.log(`Found confirmed delivery: ${delivery.deliveryId} for request ${delivery.requestId}`);
                            
                            // Get crop details
                            let cropName = `Crop #${request.cropID}`;
                            try {
                                const crop = await contract.methods.getCrop(request.cropID).call({from: account});
                                cropName = crop.cropName;
                            } catch (error) {
                                console.error("Error getting crop name:", error);
                            }
                            
                            // Get buyer details
                            let buyerName = request.buyer.substring(0, 6) + "..." + request.buyer.substring(request.buyer.length - 4);
                            try {
                                const buyerProfile = await contract.methods.getBuyerProfile(request.buyer).call({from: account});
                                if (buyerProfile && buyerProfile.name) {
                                    buyerName = buyerProfile.name;
                                }
                            } catch (error) {
                                console.warn("Could not get buyer name:", error);
                            }
                            
                            // Calculate payment amount
                            const paymentAmount = web3.utils.fromWei(delivery.amountHeld.toString(), 'ether');
                            
                            // Show notification
                            setSnackbar({
                                open: true,
                                message: `${buyerName} has confirmed delivery of ${cropName}. Payment of ${paymentAmount} ETH has been released to your account!`,
                                severity: "success",
                                duration: 10000
                            });
                            
                            // Show more detailed alert
                            setTimeout(() => {
                                alert(`Delivery Confirmed - Payment Released!\n\n` +
                                      `Buyer: ${buyerName}\n` +
                                      `Crop: ${cropName}\n` +
                                      `Quantity: ${request.quantity} kg\n` +
                                      `Payment: ${paymentAmount} ETH\n\n` +
                                      `The payment has been transferred to your wallet. Thank you for using Farm Assure!`);
                            }, 1000);
                            
                            // Add to notified deliveries
                            notifiedDeliveries.push(delivery.deliveryId.toString());
                        }
                    } catch (error) {
                        console.error(`Error checking request for delivery ${delivery.deliveryId}:`, error);
                    }
                }
            }
            
            // Save updated notified deliveries to localStorage
            if (notifiedDeliveries.length > 0) {
                localStorage.setItem('farmerNotifiedDeliveries', JSON.stringify(notifiedDeliveries));
            }
        } catch (error) {
            console.error("Error checking for confirmed deliveries:", error);
        }
    };

    // Add to existing useEffect or create a new one to check for confirmed deliveries
    useEffect(() => {
        // Check for confirmed deliveries on initial load
        checkForConfirmedDeliveries();
        
        // Set up interval to check periodically (every 30 seconds)
        const intervalId = setInterval(checkForConfirmedDeliveries, 30000);
        
        return () => clearInterval(intervalId);
    }, [contract, account, web3]);

    // Add a useEffect to prefetch images when the component mounts or crops change
    useEffect(() => {
        if (!crops || crops.length === 0) return;
        
        console.log("Starting to prefetch images for all crop listings...");
        
        // Prefetch all crop images to improve initial loading experience
        crops.forEach((crop, index) => {
            if (crop && crop.imageCID && crop.imageCID !== '') {
                const cropId = crop.cropID ? crop.cropID.toString() : '';
                
                // Use a timeout to stagger requests and not overwhelm the network
                setTimeout(() => {
                    // Try to fetch directly from IPFS with our enhanced method
                    fetchDirectImageIfNeeded(crop.imageCID, cropId);
                }, index * 300); // Stagger by 300ms per image
            }
        });
    }, [crops]);
    return (
        <Box sx={{ 
            flexGrow: 1, 
            minHeight: '100vh', 
            bgcolor: theme === 'dark' ? '#0a0a0a' : '#F9FAFB',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Redesigned Header with Center Tabs */}
            <Box sx={{ 
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                bgcolor: theme === 'dark' ? '#000000' : '#ffffff',
                borderBottom: `1px solid ${theme === 'dark' ? '#1a1a1a' : '#e5e7eb'}`,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            }}>
                <Box sx={{ 
                    maxWidth: '1400px', 
                    mx: 'auto', 
                    px: { xs: 2, sm: 3, md: 4 },
                    py: 1.5
                }}>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        height: 64
                    }}>
                        {/* Top-Left: App Logo + Name */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
                        >
                            <Box sx={{ 
                                width: 40, 
                                height: 40, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                            }}>
                                <AgricultureIcon sx={{ fontSize: 22, color: 'white' }} />
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ 
                                    fontWeight: 700, 
                                    color: theme === 'dark' ? '#ffffff' : '#1f2937',
                                    fontSize: '20px',
                                    lineHeight: 1.2,
                                    letterSpacing: '-0.025em'
                                }}>
                                    Farm Assure
                                </Typography>
                                <Typography variant="caption" sx={{ 
                                    color: theme === 'dark' ? '#71717a' : '#6b7280',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    letterSpacing: '0.025em'
                                }}>
                                    FARMER DASHBOARD
                                </Typography>
                            </Box>
                        </motion.div>

                        {/* Top-Center: Navigation Tabs */}
                        <Box sx={{ 
                            display: { xs: 'none', md: 'flex' }, 
                            alignItems: 'center', 
                            gap: 0,
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)'
                        }}>
                            {['My Listings', 'Purchase Requests', 'Orders & Cultivation'].map((tab, index) => (
                                <Box
                                    key={index}
                                    onClick={() => setTabValue(index)}
                sx={{ 
                                        px: 4,
                                        py: 2,
                                        cursor: 'pointer',
                                        color: tabValue === index 
                                            ? (theme === 'dark' ? '#667eea' : '#4f46e5')
                                            : (theme === 'dark' ? '#94a3b8' : '#64748b'),
                                        fontWeight: tabValue === index ? 600 : 500,
                                        fontSize: '15px',
                                        position: 'relative',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            color: theme === 'dark' ? '#667eea' : '#4f46e5',
                                        },
                                        '&::after': tabValue === index ? {
                                            content: '""',
                                            position: 'absolute',
                                            bottom: -2,
                                            left: 0,
                                            right: 0,
                                            height: '3px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            borderRadius: '2px'
                                        } : {}
                                    }}
                                >
                                    {tab}
                                </Box>
                            ))}
                        </Box>

                        {/* Right side actions */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {/* Notifications */}
                            {hasNewRequests && (
                        <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <IconButton 
                                        onClick={() => setTabValue(1)}
                                        sx={{ 
                                            width: 44,
                                            height: 44,
                                            bgcolor: theme === 'dark' ? '#1a1a1a' : '#f8fafc',
                                            border: `1px solid ${theme === 'dark' ? '#262626' : '#e2e8f0'}`,
                                            borderRadius: '12px',
                                            color: theme === 'dark' ? '#ffffff' : '#1e293b',
                                            '&:hover': { 
                                                bgcolor: theme === 'dark' ? '#262626' : '#e2e8f0',
                                                transform: 'translateY(-1px)',
                                                boxShadow: theme === 'dark' 
                                                    ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                                                    : '0 4px 12px rgba(0, 0, 0, 0.1)'
                                            },
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <Badge 
                                            color="error" 
                                            variant="dot"
                                            sx={{
                                                '& .MuiBadge-dot': {
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%'
                                                }
                                            }}
                                        >
                                            <NotificationsIcon sx={{ fontSize: 20 }} />
                                </Badge>
                            </IconButton>
                                </motion.div>
                            )}

                            {/* Theme Toggle */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <ThemeToggle />
                            </motion.div>

                            {/* User Profile */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Box
                            onClick={() => navigate("/profile")}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        px: 2,
                                        py: 1,
                                        borderRadius: '12px',
                                        bgcolor: theme === 'dark' ? '#1a1a1a' : '#f8fafc',
                                        border: `1px solid ${theme === 'dark' ? '#262626' : '#e2e8f0'}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: theme === 'dark' ? '#262626' : '#e2e8f0',
                                            transform: 'translateY(-1px)',
                                            boxShadow: theme === 'dark' 
                                                ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                                                : '0 4px 12px rgba(0, 0, 0, 0.1)'
                                        }
                                    }}
                                >
                                    <Avatar 
                                        src={profileImageUrl} 
                                        sx={{ 
                                            width: 32, 
                                            height: 32,
                                            bgcolor: '#667eea',
                                            fontSize: '14px',
                                            fontWeight: 600
                                        }}
                                    >
                                        <PersonIcon sx={{ fontSize: 18 }} />
                                    </Avatar>
                                    <Typography variant="body2" sx={{ 
                                        fontWeight: 600,
                                        color: theme === 'dark' ? '#ffffff' : '#1e293b',
                                        fontSize: '14px',
                                        display: { xs: 'none', sm: 'block' }
                                    }}>
                                        {farmerName || (localAccount ? `${localAccount.substring(0, 6)}...${localAccount.substring(localAccount.length - 4)}` : 'Not Connected')}
                                    </Typography>
                    </Box>
                            </motion.div>

                            {/* Logout */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                        <IconButton 
                                    onClick={() => navigate("/")}
                                    sx={{ 
                                        width: 44,
                                        height: 44,
                                        bgcolor: theme === 'dark' ? '#1a1a1a' : '#f8fafc',
                                        border: `1px solid ${theme === 'dark' ? '#262626' : '#e2e8f0'}`,
                                        borderRadius: '12px',
                                        color: '#ef4444',
                                        '&:hover': { 
                                            bgcolor: 'rgba(239, 68, 68, 0.1)',
                                            transform: 'translateY(-1px)',
                                            boxShadow: theme === 'dark' 
                                                ? '0 4px 12px rgba(239, 68, 68, 0.2)' 
                                                : '0 4px 12px rgba(239, 68, 68, 0.15)'
                                        },
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <LogoutIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                            </motion.div>

                            {/* Sync Button */}
                            <Tooltip title="Force Sync Removed Crops" arrow>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <IconButton 
                            onClick={forceSyncRemovedCrops}
                            sx={{ 
                                            width: 44,
                                            height: 44,
                                            bgcolor: theme === 'dark' ? '#1a1a1a' : '#f8fafc',
                                            border: `1px solid ${theme === 'dark' ? '#262626' : '#e2e8f0'}`,
                                            borderRadius: '12px',
                                            color: theme === 'dark' ? '#ffffff' : '#1e293b',
                                '&:hover': {
                                                bgcolor: theme === 'dark' ? '#262626' : '#e2e8f0',
                                                transform: 'translateY(-1px)',
                                                boxShadow: theme === 'dark' 
                                                    ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                                                    : '0 4px 12px rgba(0, 0, 0, 0.1)'
                                            },
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <SyncIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                                </motion.div>
                    </Tooltip>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ 
                maxWidth: '1400px', 
                mx: 'auto', 
                px: { xs: 2, sm: 3, md: 4 },
                py: 4
            }}>




                {tabValue === 0 && (
                    // My Listings Tab - Premium Cards
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        {/* Welcome Section with Add Crop Button - Only in My Listings */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                        >
                            <Box sx={{ 
                                mb: 4, 
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 3,
                                py: 2
                            }}>
                                {/* Left side - Welcome text */}
                                <Box sx={{ flex: 1, textAlign: 'left' }}>
                                    <Typography variant="h3" component="h1" sx={{ 
                                        fontWeight: 700, 
                                        color: theme === 'dark' ? '#ffffff' : '#0f172a',
                                        mb: 1,
                                        fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
                                        letterSpacing: '-0.025em',
                                        lineHeight: 1.2,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}>
                                        Welcome back, {farmerName || 'Farmer'}!
                    </Typography>
                                    <Typography variant="h6" sx={{ 
                                        color: theme === 'dark' ? '#94a3b8' : '#64748b',
                                        fontWeight: 400,
                                        fontSize: '1.1rem',
                                        maxWidth: '600px'
                                    }}>
                                        Manage your crops, track orders, and grow your business
                                    </Typography>
                                </Box>
                                
                                {/* Right side - Add Crop Button */}
                                <Box sx={{ flexShrink: 0 }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenAddDialog}
                                        sx={{
                                            borderRadius: '16px',
                                            px: 4,
                                            py: 2,
                                            fontWeight: 700,
                                            textTransform: 'none',
                                            fontSize: '16px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                                boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)',
                                                transform: 'translateY(-2px)'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                    >
                        Add New Crop
                    </Button>
                </Box>
                            </Box>
                        </motion.div>
                        {loading ? (
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                py: 12,
                                borderRadius: '20px',
                                bgcolor: theme === 'dark' ? '#0f0f0f' : '#ffffff',
                                border: `1px solid ${theme === 'dark' ? '#1a1a1a' : '#e2e8f0'}`
                            }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                                    <Box sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: '50%',
                                        background: `conic-gradient(${theme === 'dark' ? '#667eea' : '#4f46e5'}, ${theme === 'dark' ? '#764ba2' : '#7c3aed'}, ${theme === 'dark' ? '#667eea' : '#4f46e5'})`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        animation: 'spin 2s linear infinite',
                                        '&::before': {
                                            content: '""',
                                            width: 45,
                                            height: 45,
                                            borderRadius: '50%',
                                            bgcolor: theme === 'dark' ? '#0f0f0f' : '#ffffff'
                                        }
                                    }} />
                                    <Typography variant="h6" sx={{ 
                                        color: theme === 'dark' ? '#ffffff' : '#0f172a',
                                        fontWeight: 600
                                    }}>
                                        Loading your crops...
                                    </Typography>
                                </Box>
                            </Box>
                        ) : crops.length > 0 ? (
                            <Grid container spacing={4}>
                                {crops.map((crop, index) => (
                                    <Grid item xs={12} sm={6} lg={4} key={index}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, delay: index * 0.1 }}
                                            whileHover={{ y: -12, scale: 1.02 }}
                                        >
                                            <Box sx={{ 
                                                height: '100%', 
                                                display: 'flex', 
                                                flexDirection: 'column', 
                                                position: 'relative',
                                                borderRadius: '24px',
                                                bgcolor: theme === 'dark' ? '#0f0f0f' : '#ffffff',
                                                border: `1px solid ${theme === 'dark' ? '#1a1a1a' : '#e2e8f0'}`,
                                                overflow: 'hidden',
                                                boxShadow: theme === 'dark' 
                                                    ? '0 8px 30px rgba(0, 0, 0, 0.4)' 
                                                    : '0 8px 30px rgba(0, 0, 0, 0.08)',
                                                '&:hover': {
                                                    boxShadow: theme === 'dark' 
                                                        ? '0 20px 40px rgba(0, 0, 0, 0.6)' 
                                                        : '0 20px 40px rgba(0, 0, 0, 0.12)',
                                                    borderColor: theme === 'dark' ? '#262626' : '#cbd5e1'
                                                },
                                                transition: 'all 0.4s ease',
                                                cursor: 'pointer'
                                            }}>
                                                {/* Premium Status Badge */}
                                        {hasBidsForCrop(crop.cropID) ? (
                                                    <Box sx={{
                                                    position: 'absolute',
                                                        top: 16,
                                                        right: 16,
                                                    zIndex: 1,
                                                        px: 2,
                                                        py: 1,
                                                        borderRadius: '12px',
                                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                    color: 'white',
                                                        fontWeight: 700,
                                                        fontSize: '12px',
                                                    display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 0.5,
                                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                                        backdropFilter: 'blur(10px)'
                                                    }}>
                                                        <AttachMoneyIcon sx={{ fontSize: 14 }} />
                                                {countCustomBidsForCrop(crop.cropID)} BIDS
                                            </Box>
                                        ) : countBidsForCrop(crop.cropID) > 0 ? (
                                                    <Box sx={{
                                                    position: 'absolute',
                                                        top: 16,
                                                        right: 16,
                                                    zIndex: 1,
                                                        px: 2,
                                                        py: 1,
                                                        borderRadius: '12px',
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    color: 'white',
                                                        fontWeight: 700,
                                                        fontSize: '12px',
                                                    display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 0.5,
                                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                                        backdropFilter: 'blur(10px)'
                                                    }}>
                                                        <NotificationsIcon sx={{ fontSize: 14 }} />
                                                {countBidsForCrop(crop.cropID)} REQUESTS
                                            </Box>
                                        ) : null}
                                                {/* Premium Image Section */}
                                                <Box sx={{ 
                                                position: 'relative',
                                                    height: 220, 
                                                    bgcolor: theme === 'dark' ? '#1a1a1a' : '#f8fafc',
                                                    overflow: 'hidden',
                                                    '&::after': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        left: 0,
                                                        right: 0,
                                                        height: '40%',
                                                        background: `linear-gradient(to top, ${theme === 'dark' ? 'rgba(15, 15, 15, 0.8)' : 'rgba(255, 255, 255, 0.8)'}, transparent)`,
                                                        pointerEvents: 'none'
                                                    }
                                                }}>
                                                    {loadingImages[crop.cropID.toString()] && (
                                                        <Box sx={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            right: 0,
                                                            bottom: 0,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            bgcolor: theme === 'dark' ? '#1a1a1a' : '#f8fafc'
                                                        }}>
                                                            <CircularProgress size={32} sx={{ color: '#667eea' }} />
                                                        </Box>
                                                    )}
                                            <img
                                                src={getCropImageUrl(crop)}
                                                alt={crop.cropName}
                                                data-cid={crop.imageCID}
                                                onError={(e) => handleImageError(e, crop.cropID.toString(), crop.imageCID)}
                                                onLoad={() => handleImageLoad(crop.cropID.toString())}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    objectPosition: 'center',
                                                            transition: 'all 0.4s ease',
                                                            opacity: loadingImages[crop.cropID.toString()] ? 0 : 1,
                                                            filter: 'contrast(1.1) saturate(1.1)'
                                                }}
                                            />
                                        </Box>

                                                {/* Premium Content Section */}
                                                <Box sx={{ p: 4, flexGrow: 1 }}>
                                                    <Typography variant="h5" component="h3" sx={{ 
                                                        fontWeight: 700, 
                                                        color: theme === 'dark' ? '#ffffff' : '#0f172a',
                                                        mb: 3,
                                                        fontSize: '1.25rem'
                                                    }}>
                                                {crop.cropName}
                                            </Typography>
                                                    
                                                    <Stack spacing={2.5}>
                                                        <Box sx={{ 
                                                            display: 'flex', 
                                                            justifyContent: 'space-between', 
                                                            alignItems: 'center',
                                                            p: 2,
                                                            borderRadius: '12px',
                                                            bgcolor: theme === 'dark' ? '#1a1a1a' : '#f8fafc',
                                                            border: `1px solid ${theme === 'dark' ? '#262626' : '#e2e8f0'}`
                                                        }}>
                                                            <Typography variant="body2" sx={{ 
                                                                color: theme === 'dark' ? '#94a3b8' : '#64748b',
                                                                fontWeight: 500
                                                            }}>
                                                                Price per kg
                                            </Typography>
                                                            <Typography variant="h6" sx={{ 
                                                                fontWeight: 700, 
                                                                color: '#10b981',
                                                                fontSize: '1.1rem'
                                                            }}>
                                                                {formatEthPrice(crop.price)}
                                            </Typography>
                                                        </Box>
                                                        
                                                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                                                            <Box sx={{ 
                                                                p: 2,
                                                                borderRadius: '12px',
                                                                bgcolor: theme === 'dark' ? '#1a1a1a' : '#f8fafc',
                                                                border: `1px solid ${theme === 'dark' ? '#262626' : '#e2e8f0'}`,
                                                                textAlign: 'center'
                                                            }}>
                                                                <Typography variant="caption" sx={{ 
                                                                    color: theme === 'dark' ? '#94a3b8' : '#64748b',
                                                                    fontWeight: 500,
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.5px'
                                                                }}>
                                                                    Available
                                            </Typography>
                                                                <Typography variant="h6" sx={{ 
                                                                    fontWeight: 700, 
                                                                    color: theme === 'dark' ? '#ffffff' : '#0f172a',
                                                                    fontSize: '1rem'
                                                                }}>
                                                                    {crop.quantity.toString()} kg
                                            </Typography>
                                                            </Box>
                                                            
                                                            <Box sx={{ 
                                                                p: 2,
                                                                borderRadius: '12px',
                                                                bgcolor: theme === 'dark' ? '#1a1a1a' : '#f8fafc',
                                                                border: `1px solid ${theme === 'dark' ? '#262626' : '#e2e8f0'}`,
                                                                textAlign: 'center'
                                                            }}>
                                                                <Typography variant="caption" sx={{ 
                                                                    color: theme === 'dark' ? '#94a3b8' : '#64748b',
                                                                    fontWeight: 500,
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.5px'
                                                                }}>
                                                                    ID
                            </Typography>
                                                                <Typography variant="h6" sx={{ 
                                                                    fontWeight: 700, 
                                                                    color: theme === 'dark' ? '#ffffff' : '#0f172a',
                                                                    fontSize: '1rem',
                                                                    fontFamily: 'monospace'
                                                                }}>
                                                                    #{crop.cropID.toString()}
                                                                </Typography>
                            </Box>
                        </Box>

                                                        <Box sx={{ 
                                                            p: 2,
                                                            borderRadius: '12px',
                                                            bgcolor: theme === 'dark' ? '#1a1a1a' : '#f8fafc',
                                                            border: `1px solid ${theme === 'dark' ? '#262626' : '#e2e8f0'}`,
                                                            textAlign: 'center'
                                                        }}>
                                                            <Typography variant="caption" sx={{ 
                                                                color: theme === 'dark' ? '#94a3b8' : '#64748b',
                                                                fontWeight: 500,
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.5px'
                                                            }}>
                                                                Cultivation Date
                            </Typography>
                                                            <Typography variant="body1" sx={{ 
                                                                fontWeight: 600, 
                                                                color: theme === 'dark' ? '#ffffff' : '#0f172a'
                                                            }}>
                                                                {crop.deliveryDate}
                            </Typography>
                                </Box>
                                                    </Stack>
                                                </Box>

                                                {/* Premium Action Buttons */}
                                                <Box sx={{ p: 4, pt: 0 }}>
                                                    <Stack direction="row" spacing={2}>
                                                        <motion.div 
                                                            style={{ flex: 1 }} 
                                                            whileHover={{ scale: 1.02 }} 
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                <Button
                                                                fullWidth
                                    variant="outlined"
                                                startIcon={<DeleteIcon />} 
                                                onClick={() => handleOpenConfirmDialog(crop.cropID, crop.cropName)}
                                                                sx={{
                                                                    borderRadius: '12px',
                                                                    py: 1.5,
                                                                    textTransform: 'none',
                                                                    fontWeight: 600,
                                                                    borderColor: '#ef4444',
                                                                    color: '#ef4444',
                                                                    '&:hover': {
                                                                        bgcolor: 'rgba(239, 68, 68, 0.1)',
                                                                        borderColor: '#dc2626'
                                                                    }
                                                                }}
                                            >
                                                Remove
                                </Button>
                                                        </motion.div>
                                                        <motion.div 
                                                            style={{ flex: 2 }} 
                                                            whileHover={{ scale: 1.02 }} 
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                <Button
                                                                fullWidth
                                    variant="contained"
                                                                startIcon={<AttachMoneyIcon />}
                                                onClick={() => handleViewBidsForCrop(crop.cropID, crop.cropName)}
                                                                sx={{
                                                                    borderRadius: '12px',
                                                                    py: 1.5,
                                                                    textTransform: 'none',
                                                                    fontWeight: 700,
                                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                                                    '&:hover': {
                                                                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                                                        boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)'
                                                                    }
                                                                }}
                                            >
                                                {countBidsForCrop(crop.cropID) > 0 
                                                    ? `View ${countBidsForCrop(crop.cropID)} ${countBidsForCrop(crop.cropID) === 1 ? 'Request' : 'Requests'}` 
                                                    : 'View Requests'}
                                </Button>
                                                        </motion.div>
                                                    </Stack>
                            </Box>
                                            </Box>
                                        </motion.div>
                                </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Box sx={{ 
                                p: 8, 
                                textAlign: 'center',
                                borderRadius: '24px',
                                bgcolor: theme === 'dark' ? '#0f0f0f' : '#ffffff',
                                border: `1px solid ${theme === 'dark' ? '#1a1a1a' : '#e2e8f0'}`,
                                boxShadow: theme === 'dark' 
                                    ? '0 8px 30px rgba(0, 0, 0, 0.4)' 
                                    : '0 8px 30px rgba(0, 0, 0, 0.08)'
                            }}>
                                <Box sx={{ 
                                    width: 120, 
                                    height: 120, 
                                    borderRadius: '50%', 
                                    background: `conic-gradient(${theme === 'dark' ? '#1a1a1a' : '#f8fafc'}, ${theme === 'dark' ? '#262626' : '#e2e8f0'}, ${theme === 'dark' ? '#1a1a1a' : '#f8fafc'})`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 4,
                                    position: 'relative',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        inset: 8,
                                        borderRadius: '50%',
                                        bgcolor: theme === 'dark' ? '#0f0f0f' : '#ffffff'
                                    }
                                }}>
                                    <AgricultureIcon sx={{ 
                                        fontSize: 48, 
                                        color: theme === 'dark' ? '#667eea' : '#4f46e5',
                                        zIndex: 1
                                    }} />
                                </Box>
                                <Typography variant="h4" sx={{ 
                                    fontWeight: 700, 
                                    color: theme === 'dark' ? '#ffffff' : '#0f172a',
                                    mb: 2
                                }}>
                                    No crops listed yet
                                </Typography>
                                <Typography variant="h6" sx={{ 
                                    color: theme === 'dark' ? '#94a3b8' : '#64748b',
                                    mb: 4,
                                    maxWidth: 500,
                                    mx: 'auto',
                                    fontWeight: 400
                                }}>
                                    Start by adding your first crop to the marketplace. Create beautiful listings and connect with buyers worldwide.
                                                </Typography>
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                                            <Button
                                                                variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={handleOpenAddDialog}
                                        sx={{
                                            borderRadius: '16px',
                                            px: 4,
                                            py: 2,
                                            fontWeight: 700,
                                            textTransform: 'none',
                                            fontSize: '16px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                                boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)'
                                            }
                                        }}
                                    >
                                        Add Your First Crop
                                                            </Button>
                                </motion.div>
                                                        </Box>
                                                    )}
                    </motion.div>
                )}

                {tabValue === 1 && (
                    // Purchase Requests Tab
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        
                        
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">Purchase Requests</Typography>
                                    <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                                        <InputLabel>Sort By</InputLabel>
                                        <Select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            label="Sort By"
                                        >
                                            <MenuItem value="dateDesc">Newest First</MenuItem>
                                            <MenuItem value="dateAsc">Oldest First</MenuItem>
                                            <MenuItem value="bidDesc">Highest Bid First</MenuItem>
                                            <MenuItem value="bidAsc">Lowest Bid First</MenuItem>
                                            <MenuItem value="percentDesc">Highest % Increase First</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                                
                                <TableContainer component={Paper} sx={{ mt: 3 }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableRow>
                                                <TableCell>Crop</TableCell>
                                                <TableCell>Buyer</TableCell>
                                                <TableCell>Quantity</TableCell>
                                                <TableCell>Price (ETH)</TableCell>
                                                <TableCell>Bid</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                            {getSortedRequests().length > 0 ? (
                                                getSortedRequests().map((request, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{request.cropName}</TableCell>
                                                        <TableCell>{request.buyerName}</TableCell>
                                                        <TableCell>{request.quantity.toString()} kg</TableCell>
                                                        <TableCell>{formatEthInr(request.priceInEther, ethInrRate)}</TableCell>
                                                    <TableCell>
                                                            {request.hasBid ? (
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                                    <Typography variant="body2" fontWeight="bold">
                                                                        {formatEthInr(request.bidPriceInEther, ethInrRate)}
                                                        </Typography>
                                                                    <Chip 
                                                                        size="small"
                                                                        label={`${request.priceDiffPercentage >= 0 ? '+' : ''}${request.priceDiffPercentage.toFixed(1)}%`}
                                                                        color={request.priceDiffPercentage >= 0 ? "success" : "error"}
                                                                        sx={{ mt: 0.5 }}
                                                                    />
                                                                </Box>
                                                            ) : (
                                                                <Typography variant="body2" color="text.secondary">
                                                                    No Bid
                                                        </Typography>
                                                            )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                                label={request.statusText} 
                                                            color={
                                                                    request.status.toString() === "0" ? "warning" : 
                                                                    request.status.toString() === "1" ? "success" : "error"
                                                            }
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                            {request.status.toString() === "0" && (
                                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                                <Button
                                                                    variant="contained"
                                                                    color="success"
                                                                    size="small"
                                                                    onClick={() => checkMetaMaskAndAcceptBid({requestId: request.requestId})}
                                                                    disabled={loading}
                                                                >
                                                                    Accept
                                                                </Button>
                                                                <Button
                                                                        variant="outlined" 
                                                                    color="error"
                                                                    size="small"
                                                                        onClick={() => handleRespondToPurchaseRequest(request.requestId, false)}
                                                                        disabled={loading}
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </Box>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center">
                                                    <Box sx={{ p: 2 }}>
                                                        <Typography variant="body1" color="text.secondary" gutterBottom>
                                                            No purchase requests found in table.
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Raw purchaseRequests array has {purchaseRequests.length} items.
                                                        </Typography>
                                                        {purchaseRequests.length > 0 && (
                                                            <Box sx={{ mt: 2, textAlign: 'left' }}>
                                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                    Raw Data (showing first 3):
                                                                </Typography>
                                                                {purchaseRequests.slice(0, 3).map((req, idx) => (
                                                                    <Typography key={idx} variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', mb: 1 }}>
                                                                        {idx + 1}. ID: {req.requestId} | Crop: {req.cropId} | Buyer: {req.buyer?.substring(0, 10)}... | Status: {req.status}
                                                                    </Typography>
                                                                ))}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            </>
                        )}
                    </motion.div>
                )}

                {tabValue === 2 && (
                    // Orders & Cultivation Tab
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-foreground">Orders & Cultivation</h3>
                            <p className="text-muted-foreground">Track your orders and manage deliveries</p>
                        </div>
                        
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                {/* Active Orders Section */}
                                <Paper sx={{ p: 3, mb: 3 }}>
                                    <Typography variant="h6" gutterBottom color="primary.main">
                                        Active Orders - Payment Received
                                    </Typography>
                                    {activeOrders && activeOrders.length > 0 ? (
                                        <Grid container spacing={3}>
                                            {activeOrders.map((order, index) => (
                                                <Grid item xs={12} md={6} key={index}>
                                                    <Box sx={{
                                                        p: 2,
                                                        borderRadius: '12px',
                                                        bgcolor: theme === 'dark' ? '#0f0f0f' : '#ffffff',
                                                        border: `1px solid ${theme === 'dark' ? '#1a1a1a' : '#e2e8f0'}`,
                                                        display: 'grid',
                                                        gap: 1.25
                                                    }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="caption" sx={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
                                                                Active Order
                                                            </Typography>
                                                            <Chip label="Payment Received" color="success" size="small" />
                                                        </Box>
                                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
                                                            <Box>
                                                                <Typography variant="caption" sx={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>Crop</Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                    {order.cropName || `Crop #${order.cropID}`}
                                                        </Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="caption" sx={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>Quantity</Typography>
                                                                <Typography variant="body2">{order.quantity} kg</Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="caption" sx={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>Buyer</Typography>
                                                                <Typography variant="body2">
                                                                    {order.buyerName || `${order.buyer.substring(0, 6)}...${order.buyer.substring(order.buyer.length - 4)}`}
                                                        </Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="caption" sx={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>Payment</Typography>
                                                                <Typography variant="body2">{order.paymentAmount} ETH</Typography>
                                                            </Box>
                                                        </Box>
                                                        <Box sx={{ mt: 0.5, display: 'flex', gap: 1 }}>
                                                            <Button variant="outlined" size="small" onClick={() => handleViewOrderDetails(order)}>
                                                                View Details
                                                            </Button>
                                                            <Button variant="outlined" color="primary" size="small" onClick={() => markOrderAsDelivered(order.cropID)}>
                                                                Mark as Delivered
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 4 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                No active orders at the moment.
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                Orders will appear here after buyers complete their purchases.
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>

                                {/* Completed Orders Section */}
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom color="success.main">
                                        Completed Orders
                                    </Typography>
                                    {completedOrders && completedOrders.length > 0 ? (
                                        <Grid container spacing={3}>
                                            {completedOrders.map((order, index) => (
                                                <Grid item xs={12} md={6} key={index}>
                                                    <Box sx={{
                                                        p: 2,
                                                        borderRadius: '12px',
                                                        bgcolor: theme === 'dark' ? '#0f0f0f' : '#ffffff',
                                                        border: `1px solid ${theme === 'dark' ? '#1a1a1a' : '#e2e8f0'}`,
                                                        display: 'grid',
                                                        gap: 1.25
                                                    }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="caption" sx={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
                                                                Completed Order
                                                            </Typography>
                                                            <Chip label="Delivered" color="success" size="small" />
                                                        </Box>
                                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
                                                            <Box>
                                                                <Typography variant="caption" sx={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>Crop</Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                    {order.cropName || `Crop #${order.cropID}`}
                                                        </Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="caption" sx={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>Quantity</Typography>
                                                                <Typography variant="body2">{order.quantity} kg</Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="caption" sx={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>Buyer</Typography>
                                                                <Typography variant="body2">
                                                                    {order.buyerName || `${order.buyer.substring(0, 6)}...${order.buyer.substring(order.buyer.length - 4)}`}
                                                        </Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="caption" sx={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>Payment Released</Typography>
                                                                <Typography variant="body2">{order.paymentAmount} ETH</Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="caption" sx={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>Delivery Date</Typography>
                                                                <Typography variant="body2">{order.deliveryDate || 'N/A'}</Typography>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 4 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                No completed orders yet.
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </>
                        )}
                    </motion.div>
                )}
            </Box>

            {/* Floating Action Button (FAB) for Add New Crop */}
            <Box sx={{ 
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 1000
            }}>
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <Fab
                        color="primary"
                        aria-label="add new crop"
                        onClick={handleOpenAddDialog}
                        sx={{
                            width: 64,
                            height: 64,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                boxShadow: '0 12px 30px rgba(102, 126, 234, 0.6)',
                                transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <AddIcon sx={{ fontSize: 28 }} />
                    </Fab>
                </motion.div>
            </Box>

            {/* Add New Crop Dialog - Premium Shadcn Style */}
            <Dialog 
                open={showAddDialog} 
                onClose={handleCloseAddDialog} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        background: theme === 'dark' ? '#0f0f0f' : '#ffffff',
                        border: `1px solid ${theme === 'dark' ? '#1a1a1a' : '#e2e8f0'}`,
                        boxShadow: theme === 'dark' 
                            ? '0 20px 60px rgba(0, 0, 0, 0.6)' 
                            : '0 20px 60px rgba(0, 0, 0, 0.15)',
                        backdropFilter: 'blur(20px)',
                        maxHeight: '90vh',
                        overflow: 'hidden'
                    }
                }}
            >
                {/* Premium Header */}
                <Box sx={{ 
                    p: 4,
                    background: theme === 'dark' 
                        ? 'linear-gradient(135deg, #1a1a1a 0%, #262626 100%)'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <Box sx={{ 
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(20px)'
                    }} />
                    
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography variant="h4" sx={{ 
                            fontWeight: 800, 
                            mb: 1,
                            background: 'linear-gradient(45deg, #ffffff 30%, #f0f9ff 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            🌱 Add New Crop
                        </Typography>
                        <Typography variant="body1" sx={{ 
                            opacity: 0.9,
                            fontSize: '16px',
                            fontWeight: 500
                        }}>
                            List your fresh produce on the marketplace and connect with buyers
                        </Typography>
                    </Box>
                </Box>

                <DialogContent sx={{ 
                    p: 4, 
                    bgcolor: theme === 'dark' ? '#0f0f0f' : '#ffffff',
                    maxHeight: 'calc(90vh - 200px)',
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                        width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: theme === 'dark' ? '#1a1a1a' : '#f1f1f1',
                        borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: theme === 'dark' ? '#333' : '#888',
                        borderRadius: '10px',
                    },
                }}>
                    <Grid container spacing={3}>
                        {/* Crop Name */}
                        <Grid item xs={12}>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ 
                                    fontWeight: 600,
                                    color: theme === 'dark' ? '#ffffff' : '#1f2937',
                                    mb: 1
                                }}>
                                    🌾 Crop Name
                                </Typography>
                                <TextField
                                    autoFocus
                                    fullWidth
                                    value={cropName}
                                    onChange={(e) => setCropName(e.target.value)}
                                    placeholder="e.g., Organic Tomatoes, Fresh Wheat..."
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '16px',
                                            bgcolor: theme === 'dark' ? '#1a1a1a' : '#f8fafc',
                                            border: `1px solid ${theme === 'dark' ? '#262626' : '#e2e8f0'}`,
                                            '&:hover': {
                                                borderColor: theme === 'dark' ? '#667eea' : '#667eea',
                                            },
                                            '&.Mui-focused': {
                                                borderColor: '#667eea',
                                                boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                                            },
                                            '& fieldset': {
                                                border: 'none'
                                            }
                                        },
                                        '& .MuiInputBase-input': {
                                            color: theme === 'dark' ? '#ffffff' : '#1f2937',
                                            fontSize: '16px',
                                            fontWeight: 500,
                                            py: 2
                                        }
                                    }}
                                />
                            </Box>
                        </Grid>

                        {/* Price and Quantity Row */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ 
                                    fontWeight: 600,
                                    color: theme === 'dark' ? '#ffffff' : '#1f2937',
                                    mb: 1
                                }}>
                                    💰 Price per kg (ETH)
                                </Typography>
                                <TextField
                                    fullWidth
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    inputProps={{ step: "0.001" }}
                                    placeholder="0.001"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '16px',
                                            bgcolor: theme === 'dark' ? '#1a1a1a' : '#f8fafc',
                                            border: `1px solid ${theme === 'dark' ? '#262626' : '#e2e8f0'}`,
                                            '&:hover': {
                                                borderColor: theme === 'dark' ? '#667eea' : '#667eea',
                                            },
                                            '&.Mui-focused': {
                                                borderColor: '#667eea',
                                                boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                                            },
                                            '& fieldset': {
                                                border: 'none'
                                            }
                                        },
                                        '& .MuiInputBase-input': {
                                            color: theme === 'dark' ? '#ffffff' : '#1f2937',
                                            fontSize: '16px',
                                            fontWeight: 500,
                                            py: 2
                                        }
                                    }}
                                />
                                {price && (
                                    <Typography variant="caption" sx={{ 
                                        color: '#10b981',
                                        fontWeight: 600,
                                        mt: 1,
                                        display: 'block'
                                    }}>
                                        💵 {formatEthInr(price, ethInrRate)}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ 
                                    fontWeight: 600,
                                    color: theme === 'dark' ? '#ffffff' : '#1f2937',
                                    mb: 1
                                }}>
                                    📦 Quantity Available (kg)
                                </Typography>
                                <TextField
                                    fullWidth
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="100"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '16px',
                                            bgcolor: theme === 'dark' ? '#1a1a1a' : '#f8fafc',
                                            border: `1px solid ${theme === 'dark' ? '#262626' : '#e2e8f0'}`,
                                            '&:hover': {
                                                borderColor: theme === 'dark' ? '#667eea' : '#667eea',
                                            },
                                            '&.Mui-focused': {
                                                borderColor: '#667eea',
                                                boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                                            },
                                            '& fieldset': {
                                                border: 'none'
                                            }
                                        },
                                        '& .MuiInputBase-input': {
                                            color: theme === 'dark' ? '#ffffff' : '#1f2937',
                                            fontSize: '16px',
                                            fontWeight: 500,
                                            py: 2
                                        }
                                    }}
                                />
                            </Box>
                        </Grid>

                        {/* Cultivation Date */}
                        <Grid item xs={12}>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ 
                                    fontWeight: 600,
                                    color: theme === 'dark' ? '#ffffff' : '#1f2937',
                                    mb: 1
                                }}>
                                    📅 Cultivation Information
                                </Typography>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                        value={cultivationDate}
                                        onChange={(val) => setCultivationDate(val)}
                                        format="yyyy-MM-dd"
                                        slotProps={{
                                            textField: {
                                                label: 'Cultivation Date',
                                                required: true,
                                                fullWidth: true,
                                                placeholder: 'Select cultivation date',
                                                sx: {
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '16px',
                                                        bgcolor: theme === 'dark' ? '#1a1a1a' : '#f8fafc',
                                                        border: `1px solid ${theme === 'dark' ? '#262626' : '#e2e8f0'}`,
                                                        '&:hover': {
                                                            borderColor: theme === 'dark' ? '#667eea' : '#667eea',
                                                        },
                                                        '&.Mui-focused': {
                                                            borderColor: '#667eea',
                                                            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                                                        },
                                                        '& fieldset': { border: 'none' }
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        color: theme === 'dark' ? '#ffffff' : '#1f2937',
                                                        fontSize: '16px',
                                                        fontWeight: 500,
                                                        py: 2
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>
                                                </Grid>

                        {/* Image Upload Section */}
                        <Grid item xs={12}>
                            <Box sx={{ 
                                p: 3,
                                borderRadius: '20px',
                                bgcolor: theme === 'dark' ? '#1a1a1a' : '#f8fafc',
                                border: `1px dashed ${theme === 'dark' ? '#262626' : '#cbd5e1'}`,
                                textAlign: 'center',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    borderColor: '#667eea',
                                    bgcolor: theme === 'dark' ? '#262626' : '#f1f5f9'
                                }
                            }}>
                                <input
                                    accept="image/*"
                                    type="file"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                    id="crop-image-upload"
                                />
                                <label htmlFor="crop-image-upload">
                                    <Button 
                                        variant="outlined" 
                                        component="span" 
                                        startIcon={<CloudUploadIcon />}
                                        sx={{
                                            borderRadius: '16px',
                                            px: 4,
                                            py: 2,
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            fontSize: '16px',
                                            color: '#667eea',
                                            borderColor: '#667eea',
                                            background: 'transparent',
                                            '&:hover': {
                                                background: 'rgba(102, 126, 234, 0.1)',
                                                borderColor: '#667eea',
                                                transform: 'translateY(-2px)'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        📸 Select Crop Image
                                    </Button>
                                </label>
                                
                                <Typography variant="body2" sx={{ 
                                    mt: 2,
                                    color: theme === 'dark' ? '#94a3b8' : '#64748b'
                                }}>
                                    Upload a high-quality image of your crop to attract more buyers
                                </Typography>

                                {cropImage && !imageCID && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Box sx={{ mt: 3 }}>
                                            <Button
                                                variant="contained"
                                                onClick={handleImageUpload}
                                                disabled={!cropImage || uploadingImage}
                                                startIcon={uploadingImage ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                                                sx={{
                                                    borderRadius: '16px',
                                                    px: 4,
                                                    py: 2,
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    fontSize: '16px',
                                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                                        transform: 'translateY(-2px)'
                                                    },
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                {uploadingImage ? "📤 Uploading..." : "⬆️ Upload to IPFS"}
                                            </Button>
                                        </Box>
                                    </motion.div>
                                )}

                                {cropImagePreview && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Box sx={{ mt: 3 }}>
                                            <img 
                                                src={cropImagePreview} 
                                                alt="Crop preview" 
                                                style={{ 
                                                    maxWidth: '100%', 
                                                    maxHeight: '200px',
                                                    borderRadius: '16px',
                                                    boxShadow: theme === 'dark' 
                                                        ? '0 8px 30px rgba(0, 0, 0, 0.4)' 
                                                        : '0 8px 30px rgba(0, 0, 0, 0.1)'
                                                }} 
                                            />
                                        </Box>
                                    </motion.div>
                                )}

                                {imageCID && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    >
                                        <Box sx={{ 
                                            mt: 3,
                                            p: 3,
                                            borderRadius: '16px',
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            color: 'white'
                                        }}>
                                            <Typography variant="h6" sx={{ 
                                                fontWeight: 700,
                                                mb: 1
                                            }}>
                                                ✅ Upload Successful!
                                            </Typography>
                                            <Typography variant="body2" sx={{ 
                                                opacity: 0.9,
                                                fontSize: '14px'
                                            }}>
                                                Your image has been securely uploaded to IPFS
                                            </Typography>
                                        </Box>
                                    </motion.div>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>

                {/* Premium Action Buttons */}
                <Box sx={{ 
                    p: 4,
                    background: theme === 'dark' ? '#0f0f0f' : '#ffffff',
                    borderTop: `1px solid ${theme === 'dark' ? '#1a1a1a' : '#e2e8f0'}`,
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'flex-end'
                }}>
                    <Button 
                        onClick={handleCloseAddDialog} 
                        sx={{
                            borderRadius: '16px',
                            px: 4,
                            py: 2,
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '16px',
                            color: theme === 'dark' ? '#94a3b8' : '#64748b',
                            '&:hover': {
                                bgcolor: theme === 'dark' ? '#1a1a1a' : '#f1f5f9'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={addListing} 
                        variant="contained"
                        disabled={loading || !cropName || !price || !quantity}
                        sx={{
                            borderRadius: '16px',
                            px: 6,
                            py: 2,
                            fontWeight: 700,
                            textTransform: 'none',
                            fontSize: '16px',
                            background: loading || !cropName || !price || !quantity 
                                ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: loading || !cropName || !price || !quantity 
                                ? 'none'
                                : '0 8px 25px rgba(102, 126, 234, 0.4)',
                            '&:hover': loading || !cropName || !price || !quantity ? {} : {
                                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                boxShadow: '0 12px 35px rgba(102, 126, 234, 0.5)',
                                transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {loading ? (
                            <>
                                <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                                Adding Crop...
                            </>
                        ) : '🚀 Add to Marketplace'}
                    </Button>
                </Box>
            </Dialog>

            {/* Confirmation Dialog for Deleting Crops */}
            <Dialog
                open={confirmDialog.open}
                onClose={loading ? undefined : handleCloseConfirmDialog}
            >
                <DialogTitle>Permanently Remove Crop</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to permanently remove "{confirmDialog.cropName}" from your listings?
                        <br /><br />
                        <strong>Important:</strong> This action will:
                        <ul>
                            <li>Set the crop's quantity to zero in the blockchain</li>
                            <li>Hide this crop from your listings permanently</li>
                            <li>The crop will remain hidden even after page refreshes</li>
                        </ul>
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDialog} color="primary" disabled={loading}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={() => removeCrop(confirmDialog.cropId)} 
                        color="error" 
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                        disabled={loading}
                    >
                        {loading ? "Removing..." : "Permanently Remove"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Bid Details Dialog */}
            <Dialog 
                open={bidDetailsDialog.open} 
                onClose={handleCloseBidDetailsDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6">
                            {bidDetailsDialog.bids.length > 0 
                                ? `${bidDetailsDialog.bids.length} ${bidDetailsDialog.bids.length === 1 ? 'Bid' : 'Bids'} for ${bidDetailsDialog.cropName}`
                                : `Bids for ${bidDetailsDialog.cropName}`
                            }
                        </Typography>
                        <IconButton
                            aria-label="close"
                            onClick={handleCloseBidDetailsDialog}
                            sx={{
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {bidDetailsDialog.bids.length === 0 ? (
                        <Box sx={{ py: 3, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                No bids have been placed for this crop yet.
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Check back later or adjust your listing to attract more buyers.
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Bid Summary
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Showing all active bids for this crop. Buyer identities are anonymized for privacy. 
                                    Bids are sorted with highest price first.
                                </Typography>
                            </Box>
                            
                            {/* Highlight highest bid section */}
                            {bidDetailsDialog.bids.length > 0 && bidDetailsDialog.bids[0].hasBid && (
                                <Paper 
                                    elevation={3} 
                                    sx={{ 
                                        mb: 3, 
                                        p: 2, 
                                        bgcolor: 'success.light', 
                                        color: 'success.contrastText',
                                        borderRadius: 2
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                        <Box>
                                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                                Highest Bid: {formatEthInr(bidDetailsDialog.bids[0].bidPrice, ethInrRate)}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Buyer:</strong> {bidDetailsDialog.bids[0].anonymousBuyerId} | 
                                                <strong> Quantity:</strong> {bidDetailsDialog.bids[0].quantity} kg
                                            </Typography>
                                            {bidDetailsDialog.bids[0].priceDiffPercentage > 0 && (
                                                <Typography variant="body2" sx={{ color: 'success.dark', fontWeight: 'bold', mt: 0.5 }}>
                                                    {bidDetailsDialog.bids[0].priceDiffPercentage.toFixed(1)}% higher than your listing price!
                                                </Typography>
                                            )}
                                        </Box>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            size="large"
                                            startIcon={<CheckCircleIcon />}
                                            onClick={() => handleAcceptBidFromDialog(bidDetailsDialog.bids[0])}
                                        >
                                            Accept Request
                                        </Button>
                                    </Box>
                                </Paper>
                            )}
                            
                            {/* Show statistics if there are multiple bids */}
                            {bidDetailsDialog.bids.length > 1 && (
                                <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    <Paper sx={{ p: 2, flex: 1, minWidth: '200px' }}>
                                        <Typography variant="subtitle2" color="text.secondary">Total Bids</Typography>
                                        <Typography variant="h6">{bidDetailsDialog.bids.length}</Typography>
                                    </Paper>
                                    <Paper sx={{ p: 2, flex: 1, minWidth: '200px', bgcolor: bidDetailsDialog.bids && bidDetailsDialog.bids.length > 0 && bidDetailsDialog.bids[0].hasBid ? 'primary.light' : 'background.paper', color: bidDetailsDialog.bids && bidDetailsDialog.bids.length > 0 && bidDetailsDialog.bids[0].hasBid ? 'primary.contrastText' : 'text.primary', border: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="subtitle2" color="inherit">Highest Offer</Typography>
                                        {bidDetailsDialog.bids && bidDetailsDialog.bids.length > 0 ? (
                                            <>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                    {bidDetailsDialog.bids[0].hasBid && bidDetailsDialog.bids[0].bidPrice && bidDetailsDialog.bids[0].bidPrice !== '0'
                                                        ? formatEthInr(bidDetailsDialog.bids[0].bidPrice, ethInrRate)
                                                        : formatEthInr(bidDetailsDialog.bids[0].basePrice || "0", ethInrRate) + ' (base)'}
                                                </Typography>
                                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                                    by {bidDetailsDialog.bids[0].anonymousBuyerId}
                                                </Typography>
                                            </>
                                        ) : (
                                            <Typography variant="body1" color="text.secondary">No bids yet</Typography>
                                        )}
                                    </Paper>
                                    <Paper sx={{ p: 2, flex: 1, minWidth: '200px' }}>
                                        <Typography variant="subtitle2" color="text.secondary">Total Quantity</Typography>
                                        <Typography variant="h6">
                                            {bidDetailsDialog.bids.reduce((acc, bid) => acc + parseInt(bid.quantity), 0)} kg
                                        </Typography>
                                    </Paper>
                                </Box>
                            )}
                            
                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                All Bids
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead sx={{ bgcolor: 'background.default' }}>
                                        <TableRow>
                                            <TableCell>Buyer ID</TableCell>
                                            <TableCell>Quantity</TableCell>
                                            <TableCell>Bid Amount</TableCell>
                                            <TableCell>Difference</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {bidDetailsDialog.bids.map((bid, index) => (
                                            <TableRow 
                                                key={index}
                                                sx={{
                                                    backgroundColor: index === 0 ? 'rgba(76, 175, 80, 0.1)' : 'inherit',
                                                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                                                }}
                                            >
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        {index === 0 && (
                                                            <Chip 
                                                                label="HIGHEST" 
                                                                color="success" 
                                                                size="small" 
                                                                sx={{ mr: 1 }}
                                                            />
                                                        )}
                                                        <Typography variant="body2">
                                                            {bid.anonymousBuyerId}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{bid.quantity} kg</TableCell>
                                                <TableCell>
                                                    {bid.hasBid && bid.bidPrice && bid.bidPrice !== '0' ? (
                                                        <Box>
                                                            <Typography fontWeight="bold" color="primary">
                                                                {formatEthInr(bid.bidPrice, ethInrRate)}
                                                            </Typography>
                                                            {index > 0 && bidDetailsDialog.bids[0].hasBid && bidDetailsDialog.bids[0].bidPrice && bidDetailsDialog.bids[0].bidPrice !== '0' && (
                                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                                    {parseFloat(bid.bidPrice) === parseFloat(bidDetailsDialog.bids[0].bidPrice) 
                                                                        ? "Same as highest bid" 
                                                                        : `${((parseFloat(bid.bidPrice) - parseFloat(bidDetailsDialog.bids[0].bidPrice)) / parseFloat(bidDetailsDialog.bids[0].bidPrice) * 100).toFixed(1)}% lower than highest`}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    ) : (
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Typography variant="body2">
                                                                {formatEthInr(bid.basePrice, ethInrRate)}
                                                            </Typography>
                                                            <Chip 
                                                                size="small"
                                                                label="Base Price"
                                                                variant="outlined"
                                                                color="default"
                                                                sx={{ ml: 1, fontSize: '0.6rem' }}
                                                            />
                                                        </Box>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {bid.hasBid && (
                                                        <Chip 
                                                            size="small"
                                                            label={`${bid.priceDiffPercentage >= 0 ? '+' : ''}${bid.priceDiffPercentage.toFixed(1)}%`}
                                                            color={bid.priceDiffPercentage >= 0 ? "success" : "error"}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        onClick={() => handleAcceptBidFromDialog(bid)}
                                                    >
                                                        Accept Request
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                                <Typography variant="body2" color="info.contrastText" gutterBottom>
                                    <strong>Note:</strong> When accepting a custom bid, the buyer will be able to complete the purchase at the bid price they offered. This allows for negotiated pricing between farmers and buyers.
                                </Typography>
                                <Typography variant="body2" color="info.contrastText" sx={{ mt: 1 }}>
                                    <strong>⚠️ Important:</strong> You will need to approve the transaction in MetaMask. If the MetaMask popup doesn't appear, check the extension icon in your browser.
                                </Typography>
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseBidDetailsDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity} 
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default FarmerDashboard;
