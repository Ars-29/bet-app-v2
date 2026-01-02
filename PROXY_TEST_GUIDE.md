# Proxy Test Guide for Kambi API

## 🧪 Testing the Proxy

### Test Endpoint Created
- **Route**: `/api/test-proxy`
- **Purpose**: Test if proxy works and check IP rotation

### How to Test

#### 1. **Local Testing** (Development)
```bash
# Start dev server
npm run dev

# Test in browser or curl:
http://localhost:3000/api/test-proxy?calls=5&direct=true
```

#### 2. **Test Parameters**
- `calls` (optional): Number of test calls to make (default: 3)
- `direct` (optional): Also test direct IP for comparison (default: false)

#### 3. **Example Test URLs**
```
# Basic test (3 calls)
/api/test-proxy

# Test with 10 calls to check rotation
/api/test-proxy?calls=10

# Test with direct IP comparison
/api/test-proxy?calls=5&direct=true
```

### Expected Response
```json
{
  "success": true,
  "message": "Proxy test completed",
  "proxyConfig": {
    "host": "46.203.47.151",
    "port": "5650",
    "username": "yeyccztb",
    "url": "http://yeyccztb:***@46.203.47.151:5650"
  },
  "testResults": [
    {
      "success": true,
      "ip": "123.45.67.89",
      "attempt": 1,
      "timestamp": "2026-01-02T10:00:00.000Z"
    },
    {
      "success": true,
      "ip": "123.45.67.90",  // Different IP = rotation working!
      "attempt": 2,
      "timestamp": "2026-01-02T10:00:01.000Z"
    }
  ],
  "summary": {
    "totalCalls": 5,
    "successfulCalls": 5,
    "uniqueIPs": 3,
    "ipRotationDetected": true,
    "ips": ["123.45.67.89", "123.45.67.90", "123.45.67.91"],
    "conclusion": "✅ IP Rotation WORKING! Detected 3 different IPs"
  }
}
```

---

## 🔄 How IP Rotation Works

### Understanding Your Proxy Setup

**Proxy Format**: `46.203.47.151:5650:yeyccztb:r7oa3qwnkid7`
- `46.203.47.151:5650` = Proxy server address
- `yeyccztb` = Username
- `r7oa3qwnkid7` = Password

### IP Rotation Behavior

#### **Scenario 1: Automatic Rotation (Most Common)**
If your proxy service **automatically rotates IPs**:
- ✅ **Each new connection** gets a different IP
- ✅ **Each API call** will use a different IP
- ✅ **No code changes needed** - rotation happens automatically

**Test Result**: You'll see different IPs in each test call

#### **Scenario 2: Session-Based Rotation**
If your proxy **rotates IP per session**:
- ⚠️ **Same connection** = Same IP
- ✅ **New connection** = New IP
- ⚠️ **May need to close/reopen connections** to rotate

**Test Result**: You might see same IP for multiple calls, but different IPs after delays

#### **Scenario 3: Time-Based Rotation**
If your proxy **rotates IP after time interval**:
- ⚠️ **Same IP** for X minutes
- ✅ **Different IP** after interval
- ⚠️ **Requires waiting** between calls

**Test Result**: Same IP initially, different IPs after waiting

#### **Scenario 4: Manual Rotation Required**
If your proxy **requires manual rotation**:
- ❌ **Same IP** until manually changed
- ⚠️ **Need proxy dashboard** to rotate
- ❌ **Not automatic**

**Test Result**: Same IP for all calls

---

## 📊 Interpreting Test Results

### ✅ **IP Rotation Working**
```json
{
  "ipRotationDetected": true,
  "uniqueIPs": 3,
  "ips": ["IP1", "IP2", "IP3"]
}
```
**Meaning**: Proxy is rotating IPs automatically! ✅

### ⚠️ **Single IP Detected**
```json
{
  "ipRotationDetected": false,
  "uniqueIPs": 1,
  "ips": ["123.45.67.89"]
}
```
**Meaning**: 
- Proxy works, but IP rotation may not be enabled
- OR rotation requires more time between calls
- OR rotation is session-based (need new connections)

### ❌ **Proxy Not Working**
```json
{
  "successfulCalls": 0,
  "error": "Connection failed"
}
```
**Meaning**: 
- Check proxy credentials
- Check proxy server is online
- Check firewall/network settings

---

## 🔍 Dry Run Analysis

### **Question: Will IP rotate for each Kambi API call?**

**Answer**: **It depends on your proxy service configuration:**

1. **If proxy auto-rotates**: ✅ **YES** - Each call = New IP
2. **If proxy rotates per session**: ⚠️ **MAYBE** - Need new connections
3. **If proxy rotates by time**: ⚠️ **MAYBE** - Need to wait between calls
4. **If manual rotation**: ❌ **NO** - Need manual intervention

### **How to Verify:**

1. **Run the test endpoint** with multiple calls:
   ```
   /api/test-proxy?calls=10
   ```

2. **Check the results**:
   - If `uniqueIPs > 1` → ✅ Rotation is working
   - If `uniqueIPs === 1` → ⚠️ Rotation may not be enabled or needs different approach

3. **For Kambi API specifically**:
   - Each call to `fetchKambiLiveData()` will use the proxy
   - If proxy auto-rotates → Each call gets new IP ✅
   - If proxy doesn't rotate → Same IP for all calls ⚠️

---

## 🚀 Next Steps

### After Testing:

1. **If rotation works** ✅:
   - Proceed to implement proxy in Kambi API calls
   - Each call will automatically use different IP

2. **If rotation doesn't work** ⚠️:
   - Check with proxy provider about rotation settings
   - May need to implement connection pooling or rotation logic
   - Consider using multiple proxy endpoints if available

3. **If proxy doesn't work** ❌:
   - Verify credentials
   - Check proxy server status
   - Test from different network

---

## 📝 Implementation Notes

### For Kambi API Integration:

When implementing proxy in `fetchKambiLiveData()`:

```javascript
// Each call creates new proxy agent = potentially new IP
const proxyAgent = new HttpsProxyAgent(PROXY_URL);
const response = await fetch(KAMBI_LIVE_API_URL, {
  agent: proxyAgent
});
```

**If proxy auto-rotates**: Each `new HttpsProxyAgent()` = New connection = New IP ✅

**If proxy doesn't auto-rotate**: May need to:
- Close connections between calls
- Use connection pooling
- Implement manual rotation logic

---

## 🔐 Security Note

**DO NOT** commit proxy credentials to git!

Use environment variables:
```env
KAMBI_PROXY_HOST=46.203.47.151
KAMBI_PROXY_PORT=5650
KAMBI_PROXY_USER=yeyccztb
KAMBI_PROXY_PASS=r7oa3qwnkid7
```

Add to `.gitignore`:
```
.env.local
.env.production
```

