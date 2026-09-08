# GuardianX Database Schema (MongoDB / Mongoose)

## Core SaaS Tenant Models

### 1. Tenant (Family)
```javascript
{
  name: String,
  ownerId: ObjectId (User),
  plan: String ['FREE', 'FAMILY', 'PREMIUM'],
  subscriptionStatus: String ['active', 'past_due', 'canceled'],
  childrenLimit: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. User
```javascript
{
  tenantId: ObjectId (Tenant), // Indexed
  role: String ['parent', 'child', 'admin'],
  name: String,
  email: String, // Unique Index
  passwordHash: String,
  avatar: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. ChildProfile
```javascript
{
  tenantId: ObjectId (Tenant),
  userId: ObjectId (User),
  parentId: ObjectId (User),
  name: String,
  dateOfBirth: Date,
  profileStatus: String ['unpaired', 'paired', 'disabled'],
  deviceId: ObjectId (Device),
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Device
```javascript
{
  tenantId: ObjectId (Tenant),
  childId: ObjectId (ChildProfile),
  deviceName: String,
  platform: String ['android', 'ios'],
  deviceIdentifier: String,
  batteryLevel: Number (0-100),
  isOnline: Boolean,
  lastSeen: Date
}
```

### 5. PairingCode
```javascript
{
  tenantId: ObjectId (Tenant),
  parentId: ObjectId (User),
  childId: ObjectId (ChildProfile),
  code: String (6 uppercase chars),
  expiresAt: Date (TTL 15 mins),
  used: Boolean
}
```

### 6. LocationRecord
```javascript
{
  tenantId: ObjectId (Tenant),
  childId: ObjectId (ChildProfile),
  latitude: Number,
  longitude: Number,
  accuracy: Number,
  timestamp: Date
}
```

### 7. Geofence
```javascript
{
  tenantId: ObjectId (Tenant),
  childId: ObjectId (ChildProfile),
  name: String,
  latitude: Number,
  longitude: Number,
  radius: Number,
  isActive: Boolean
}
```

### 8. AppUsage
```javascript
{
  tenantId: ObjectId (Tenant),
  childId: ObjectId (ChildProfile),
  packageName: String,
  appName: String,
  usageDuration: Number, // Minutes
  sessionCount: Number,
  date: String // YYYY-MM-DD
}
```

### 9. ScreenTime
```javascript
{
  tenantId: ObjectId (Tenant),
  childId: ObjectId (ChildProfile),
  date: String, // YYYY-MM-DD
  totalDuration: Number // Minutes
}
```

### 10. Alert
```javascript
{
  tenantId: ObjectId (Tenant),
  childId: ObjectId (ChildProfile),
  type: String ['sos', 'geofence_entered', 'geofence_exited', 'low_battery', 'device_offline', 'screen_time_threshold', 'routine_reminder', 'routine_completed'],
  title: String,
  message: String,
  severity: String ['critical', 'high', 'medium', 'info'],
  isRead: Boolean
}
```

### 11. SOSEvent
```javascript
{
  tenantId: ObjectId (Tenant),
  childId: ObjectId (ChildProfile),
  latitude: Number,
  longitude: Number,
  timestamp: Date,
  status: String ['active', 'resolved', 'acknowledged']
}
```

### 12. FamilyRoutine
```javascript
{
  tenantId: ObjectId (Tenant),
  childId: ObjectId (ChildProfile),
  title: String,
  type: String ['prayer_reminder', 'hadith_session'],
  scheduledTime: String, // HH:mm
  duration: Number,
  isActive: Boolean
}
```

### 13. RoutineCompletion
```javascript
{
  tenantId: ObjectId (Tenant),
  childId: ObjectId (ChildProfile),
  routineId: ObjectId (FamilyRoutine),
  date: String,
  startedAt: Date,
  completedAt: Date,
  completionStatus: String ['in_progress', 'completed', 'missed']
}
```
