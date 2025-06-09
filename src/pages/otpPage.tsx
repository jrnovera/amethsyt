import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import OtpInput from 'otp-input-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { toast, Toaster } from 'react-hot-toast';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { CgSpinner } from 'react-icons/cg';
import { BsFillShieldLockFill } from 'react-icons/bs';

declare global {
    interface Window {
        recaptchaVerifier: any;
        confirmationResult: any;
    }
}

const DEFAULT_TEST_PHONE = '1234567890';

const OtpPage = () => {
    const [otp, setOtp] = useState('');
    const [ph, setPh] = useState(DEFAULT_TEST_PHONE);
    const [loading, setLoading] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [_user, setUser] = useState<any>(null);
    const [testMode, setTestMode] = useState(true);
    const [loginData, setLoginData] = useState<{ email: string; password: string } | null>(null);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state) {
            const { email, password } = location.state as { email: string; password?: string };
            setLoginData({ email, password: password || '' });
            console.log('Received data from login page:', { email, password: password ? '********' : undefined });
        }
    }, [location]);

    const onCaptchaVerify = () => {
        if (testMode || window.recaptchaVerifier) return;

        try {
            const container = document.getElementById('recaptcha-container');
            if (!container) {
                console.error('recaptcha-container not found');
                return;
            }

            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
                callback: () => console.log('reCAPTCHA verified'),
                'expired-callback': () => {
                    toast.error('reCAPTCHA expired, please try again');
                    window.recaptchaVerifier?.clear();
                    window.recaptchaVerifier = null;
                    setLoading(false);
                },
            });
        } catch (error) {
            console.error('reCAPTCHA error:', error);
        }
    };

    const sendOtp = () => {
        setLoading(true);

        if (!ph || ph.length < 8) {
            toast.error('Please enter a valid phone number');
            setLoading(false);
            return;
        }

        const formatPh = ph.startsWith('+') ? ph : '+' + ph;

        if (testMode) {
            console.log('Test mode active, simulating OTP to:', formatPh);
            toast.success('OTP sent successfully! (Test Mode)');
            setShowOTP(true);
            setLoading(false);
            return;
        }

        onCaptchaVerify();

        signInWithPhoneNumber(auth, formatPh, window.recaptchaVerifier)
            .then((result) => {
                window.confirmationResult = result;
                toast.success('OTP sent successfully!');
                setShowOTP(true);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error sending OTP:', error);
                toast.error('Failed to send OTP. Please try again.');
                setLoading(false);
                window.recaptchaVerifier?.clear();
                window.recaptchaVerifier = null;
            });
    };

    const verifyOtp = () => {
        setLoading(true);

        if (!otp || otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            setLoading(false);
            return;
        }

        if (testMode) {
            toast.success('OTP verified successfully! (Test Mode)');
            
            // In test mode, create a simulated authenticated user by importing and using auth store
            import('../store/useAuthStore').then(({ useAuthStore }) => {
                const setAuthUser = useAuthStore.getState().setUser;
                
                // Create test user data based on login info
                const testUser = {
                    id: 'test-user-id',
                    email: loginData?.email || 'test@example.com',
                    name: loginData?.email?.split('@')[0] || 'Test User',
                    role: loginData?.email?.includes('admin') ? 'admin' as const : 'user' as const,
                    addresses: []
                };
                
                // Set the user in auth store
                setAuthUser(testUser);
                setUser(testUser);
                
                // Navigate based on user role
                setTimeout(() => {
                    if (testUser.role === 'admin') {
                        console.log('Test mode: Admin authenticated, navigating to admin dashboard');
                        navigate('/admin/dashboard');
                    } else {
                        console.log('Test mode: User authenticated, navigating to home');
                        navigate('/');
                    }
                }, 1000);
            });
            
            setLoading(false);
            return;
        }

        if (!window.confirmationResult) {
            toast.error('Please send OTP first');
            setLoading(false);
            return;
        }

        window.confirmationResult
            .confirm(otp)
            .then(async (result: any) => {
                // Set local component state
                setUser(result.user);
                toast.success('OTP verified successfully');
                console.log('Firebase user authenticated:', result.user);

                try {
                    const { doc, getDoc, setDoc } = await import('firebase/firestore');
                    const { db } = await import('../lib/firebase');
                    const { useAuthStore } = await import('../store/useAuthStore');
                    
                    // Get user document reference
                    const userDocRef = doc(db, 'users', result.user.uid);
                    const userDoc = await getDoc(userDocRef);
                    
                    let userData;
                    
                    // If user doesn't exist in Firestore yet, create a new record
                    if (!userDoc.exists()) {
                        userData = {
                            id: result.user.uid,
                            email: loginData?.email || result.user.email || '',
                            name: result.user.displayName || (loginData?.email?.split('@')[0]) || 'User',
                            role: loginData?.email?.includes('admin') ? 'admin' : 'user',
                            phoneNumber: result.user.phoneNumber,
                            addresses: []
                        };
                        await setDoc(userDocRef, userData);
                    } else {
                        userData = userDoc.data();
                        
                        // Update email if we have new data from login
                        if (loginData?.email && userData.email !== loginData.email) {
                            await setDoc(userDocRef, { ...userData, email: loginData.email }, { merge: true });
                            userData.email = loginData.email;
                        }
                    }
                    
                    // Set the user in auth store to make them authenticated across the app
                    const setAuthUser = useAuthStore.getState().setUser;
                    setAuthUser({
                        id: result.user.uid,
                        email: userData.email || '',
                        name: userData.name || 'User',
                        role: (userData.role || 'user') as 'user' | 'admin',
                        addresses: userData.addresses || []
                    });

                    // Navigate based on user role
                    if (userData?.role === 'admin') {
                        navigate('/admin/dashboard');
                    } else {
                        navigate('/');
                    }
                } catch (err) {
                    console.error('Error setting up authenticated user:', err);
                    navigate('/');
                }
            })
            .catch((error: any) => {
                console.error('Error verifying OTP:', error);
                toast.error('Invalid or expired OTP. Please try again.');
            })
            .finally(() => setLoading(false));
    };

    return (
        <section className="bg-gray-50 min-h-screen flex items-center justify-center">
            <div className="bg-white px-8 py-10 rounded-lg shadow-md max-w-md w-full">
                <div id="recaptcha-container" style={{ marginBottom: '10px' }}></div>
                <Toaster toastOptions={{ duration: 4000 }} />
                <h1 className="text-2xl font-bold mb-6 text-center">OTP Verification</h1>

                {/* Test Mode Toggle */}
                <div className="flex flex-col items-end mb-4">
                    <label className="flex items-center cursor-pointer">
                        <span className="mr-2 text-sm text-gray-600">Test Mode {testMode ? '(Recommended)' : ''}</span>
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={testMode}
                                onChange={() => {
                                    if (!testMode && window.recaptchaVerifier) {
                                        try {
                                            window.recaptchaVerifier.clear();
                                            window.recaptchaVerifier = null;
                                        } catch (error) {
                                            console.error('Error clearing reCAPTCHA:', error);
                                        }
                                    }
                                    setTestMode(!testMode);
                                }}
                            />
                            <div className={`block w-10 h-6 rounded-full ${testMode ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${testMode ? 'transform translate-x-4' : ''}`}></div>
                        </div>
                    </label>
                    {!testMode && (
                        <p className="text-xs text-red-500 mt-1">Warning: Live mode requires proper Firebase setup</p>
                    )}
                </div>

                {!showOTP ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-center mb-4">
                            <BsFillShieldLockFill size={30} className="text-purple-600" />
                        </div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Enter your phone number with country code
                        </label>
                        <PhoneInput
                            country={'us'}
                            value={ph}
                            onChange={setPh}
                            inputStyle={{ width: '100%' }}
                            containerClass="mb-6"
                        />
                        <button
                            onClick={sendOtp}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition duration-200 flex items-center justify-center"
                            disabled={loading || !ph}
                        >
                            {loading ? <CgSpinner size={20} className="animate-spin mr-2" /> : 'Send OTP'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-center mb-4">
                            <BsFillShieldLockFill size={30} className="text-purple-600" />
                        </div>
                        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                            Enter the OTP sent to your phone
                        </label>
                        <OtpInput
                            value={otp}
                            onChange={setOtp}
                            OTPLength={6}
                            otpType="number"
                            disabled={false}
                            autoFocus
                            className="flex justify-center gap-2"
                            inputClassName="w-12 h-12 border-2 rounded bg-transparent text-center text-xl"
                            renderInput={(props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />}
                        />
                        <button
                            onClick={verifyOtp}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition duration-200 flex items-center justify-center"
                            disabled={loading}
                        >
                            {loading ? <CgSpinner size={20} className="animate-spin mr-2" /> : 'Verify OTP'}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default OtpPage;
