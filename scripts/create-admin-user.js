const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaJaxzpsLe-d1D9b0v9rFSM1yZR68QsR0",
  authDomain: "eduverse-98jdv.firebaseapp.com",
  projectId: "eduverse-98jdv",
  storageBucket: "eduverse-98jdv.appspot.com",
  messagingSenderId: "1033061760650",
  appId: "1:1033061760650:web:192ad12f7649972151b773"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser(email, password, displayName) {
  try {
    console.log(`Creating admin user: ${email}`);
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log(`✅ User created with UID: ${user.uid}`);
    
    // Create user profile in Firestore
    const userProfile = {
      uid: user.uid,
      email: email,
      displayName: displayName,
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
      lastLoginAt: new Date()
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    console.log(`✅ User profile created in Firestore`);
    
    // Sign out
    await auth.signOut();
    
    console.log(`🎉 Admin user "${displayName}" created successfully!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Role: admin`);
    console.log(`\nYou can now log in at: https://elearning-4ai5.onrender.com/login`);
    
    return user.uid;
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️  User already exists. You can use these credentials to log in.');
    }
    throw error;
  }
}

// Create admin users for tomorrow
async function setupAdminUsers() {
  console.log('🚀 Setting up admin users for DM0 E-Learning Platform\n');
  
  const adminUsers = [
    {
      email: 'admin@dm0.com',
      password: 'Admin123!',
      displayName: 'DM0 Admin'
    },
    {
      email: 'manager@dm0.com', 
      password: 'Manager123!',
      displayName: 'Platform Manager'
    }
  ];
  
  for (const user of adminUsers) {
    try {
      await createAdminUser(user.email, user.password, user.displayName);
      console.log(''); // Empty line for spacing
    } catch (error) {
      console.log(''); // Empty line for spacing
    }
  }
  
  console.log('✅ Setup complete!');
  console.log('\n📋 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 Admin Account 1:');
  console.log('   Email: admin@dm0.com');
  console.log('   Password: Admin123!');
  console.log('');
  console.log('🔐 Admin Account 2:');
  console.log('   Email: manager@dm0.com');
  console.log('   Password: Manager123!');
  console.log('');
  console.log('🌐 Login URL: https://elearning-4ai5.onrender.com/login');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// Run the setup
setupAdminUsers().catch(console.error);
