import mongoose from "mongoose";
import betService from "../services/bet.service.js";

let isConnected = false;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  
  try {
    // Configure mongoose for better connection handling
    mongoose.set('strictQuery', false);
    
    // Connection options for better reliability (optimized for slow VPN connections)
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 60000, // ✅ INCREASED: 60 seconds (was 30s) - for slow VPN connections
      socketTimeoutMS: 120000, // ✅ INCREASED: 120 seconds (was 60s) - for slow VPN connections
      connectTimeoutMS: 60000, // ✅ ADDED: 60 seconds to establish initial connection
      bufferTimeoutMS: 60000, // ✅ INCREASED: 60 seconds (was 30s) - for slow VPN connections
      heartbeatFrequencyMS: 10000, // ✅ ADDED: Check connection every 10 seconds
      retryWrites: true, // ✅ ADDED: Retry writes on network errors
      retryReads: true, // ✅ ADDED: Retry reads on network errors
    };

    await mongoose.connect(mongoURI, options);
    isConnected = true;
    reconnectAttempts = 0;
    console.log("✅ Connected to MongoDB");
    console.log("MongoDB URI:", mongoURI.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")); // Hide credentials in logs
    
    // Set up connection event listeners
    setupConnectionListeners();
    
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    isConnected = false;
    throw error;
  }
};

const setupConnectionListeners = () => {
  // Handle connection events
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected');
    isConnected = true;
    reconnectAttempts = 0;
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
    isConnected = false;
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
    isConnected = false;
    // Attempt to reconnect
    attemptReconnect();
  });

  // Handle process termination
  process.on('SIGINT', async () => {
    console.log('🔄 Closing MongoDB connection...');
    await mongoose.connection.close();
    process.exit(0);
  });
};

const attemptReconnect = async () => {
  if (reconnectAttempts >= maxReconnectAttempts) {
    console.error('❌ Max reconnection attempts reached. Server will continue without database.');
    return;
  }

  reconnectAttempts++;
  console.log(`🔄 Attempting to reconnect to MongoDB (${reconnectAttempts}/${maxReconnectAttempts})...`);
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 60000, // ✅ INCREASED: 60 seconds (was 30s) - for slow VPN connections
      socketTimeoutMS: 120000, // ✅ INCREASED: 120 seconds (was 60s) - for slow VPN connections
      connectTimeoutMS: 60000, // ✅ ADDED: 60 seconds to establish initial connection
      bufferTimeoutMS: 60000, // ✅ INCREASED: 60 seconds (was 30s) - for slow VPN connections
      heartbeatFrequencyMS: 10000, // ✅ ADDED: Check connection every 10 seconds
      retryWrites: true, // ✅ ADDED: Retry writes on network errors
      retryReads: true, // ✅ ADDED: Retry reads on network errors
    });
    console.log('✅ MongoDB reconnected successfully');
    isConnected = true;
    reconnectAttempts = 0;
  } catch (error) {
    console.error(`❌ Reconnection attempt ${reconnectAttempts} failed:`, error.message);
    // Retry after 5 seconds
    setTimeout(attemptReconnect, 5000);
  }
};

// Export connection status checker
export const isDatabaseConnected = () => isConnected;

export default connectDB;
