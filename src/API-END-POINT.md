Login Flow Dynamic Screens - API Documentation
Overview
This document describes the public API endpoints for fetching login screen configurations. These endpoints allow the mobile/web app to dynamically load login screen text, placeholders, and button labels from the server, enabling superadmin to customize them from the admin panel.

Base URL
/api/v1/auth/login-config


Endpoints
1. Get All Login Screens
Fetch all login screen configurations in one call.
Endpoint: GET /api/v1/auth/login-config/screens
Query Parameters:
Parameter
Type
Required
Description
Default
platform
string
No
Filter by platform: mobile, web, all
all

Example Request:
GET /api/v1/auth/login-config/screens?platform=mobile

Success Response (200):
{
  "status": "success",
  "data": {
    "screens": [
      {
        "screen_type": "welcome",
        "title": "Find Your People, Play your Vibe",
        "subtitle": "Community-driven sports, hobbies & lifestyle ecosystem.",
        "input_placeholders": {},
        "cta_text": {
          "primary": "Continue with Phone",
          "secondary_google": "Continue with Google",
          "secondary_facebook": "Continue with Facebook",
          "secondary_apple": "Continue with Apple",
          "tertiary": "Already have an account? Sign Up"
        },
        "social_providers": {
          "google": true,
          "facebook": true,
          "apple": false
        },
        "input_fields": [],
        "actions": {
          "primary": "navigate_phone",
          "secondary_google": "social_google",
          "secondary_facebook": "social_facebook",
          "secondary_apple": "social_apple",
          "tertiary": "navigate_signup",
          "resend_otp": null
        }
      },
      {
        "screen_type": "create_account",
        "title": "Create your account",
        "subtitle": "Create a new account to get started and enjoy our features.",
        "input_placeholders": {
          "email": "Enter your email",
          "password": "Create a password",
          "confirm_password": "Re-enter password"
        },
        "cta_text": {
          "primary": "Continue"
        },
        "social_providers": {
          "google": false,
          "facebook": false,
          "apple": false
        },
        "input_fields": [
          { "key": "email", "label": "Email", "type": "email", "required": true },
          { "key": "password", "label": "Password", "type": "password", "required": true },
          { "key": "confirm_password", "label": "Re-enter Password", "type": "password", "required": true }
        ],
        "actions": {
          "primary": "submit_signup",
          "secondary_google": null,
          "secondary_facebook": null,
          "secondary_apple": null,
          "tertiary": null,
          "resend_otp": null
        }
      },
      {
        "screen_type": "phone_input",
        "title": "Login With Phone",
        "subtitle": "We'll need your phone number to send an OTP for verification.",
        "input_placeholders": {
          "country_code": "+91",
          "phone": "Enter phone number"
        },
        "cta_text": {
          "primary": "Continue"
        },
        "social_providers": {
          "google": false,
          "facebook": false,
          "apple": false
        },
        "input_fields": [
          { "key": "country_code", "label": "Country Code", "type": "text", "required": true },
          { "key": "phone", "label": "Phone Number", "type": "tel", "required": true }
        ],
        "actions": {
          "primary": "send_phone_otp",
          "secondary_google": null,
          "secondary_facebook": null,
          "secondary_apple": null,
          "tertiary": null,
          "resend_otp": null
        }
      },
      {
        "screen_type": "phone_otp",
        "title": "Enter Code",
        "subtitle": "Please enter code we just sent to {phone}",
        "input_placeholders": {},
        "cta_text": {
          "primary": "Verify",
          "resend_otp": "Didn't receive OTP? Resend Code"
        },
        "social_providers": {
          "google": false,
          "facebook": false,
          "apple": false
        },
        "input_fields": [
          { "key": "otp", "label": "OTP", "type": "number", "required": true, "length": 6 }
        ],
        "actions": {
          "primary": "verify_phone_otp",
          "secondary_google": null,
          "secondary_facebook": null,
          "secondary_apple": null,
          "tertiary": null,
          "resend_otp": "resend_phone_otp"
        }
      },
      {
        "screen_type": "email_input",
        "title": "Email Address",
        "subtitle": "We'll need your email to stay in touch.",
        "input_placeholders": {
          "email": "Enter your email"
        },
        "cta_text": {
          "primary": "Continue"
        },
        "social_providers": {
          "google": false,
          "facebook": false,
          "apple": false
        },
        "input_fields": [
          { "key": "email", "label": "Email", "type": "email", "required": true }
        ],
        "actions": {
          "primary": "send_email_otp",
          "secondary_google": null,
          "secondary_facebook": null,
          "secondary_apple": null,
          "tertiary": null,
          "resend_otp": null
        }
      },
      {
        "screen_type": "email_otp",
        "title": "Enter Code",
        "subtitle": "Please enter code we just sent to {email}",
        "input_placeholders": {},
        "cta_text": {
          "primary": "Verify",
          "resend_otp": "Didn't receive OTP? Resend Code"
        },
        "social_providers": {
          "google": false,
          "facebook": false,
          "apple": false
        },
        "input_fields": [
          { "key": "otp", "label": "OTP", "type": "number", "required": true, "length": 6 }
        ],
        "actions": {
          "primary": "verify_email_otp",
          "secondary_google": null,
          "secondary_facebook": null,
          "secondary_apple": null,
          "tertiary": null,
          "resend_otp": "resend_email_otp"
        }
      },
      {
        "screen_type": "name_capture",
        "title": "What's Your Name?",
        "subtitle": "This is how people will see you",
        "input_placeholders": {
          "full_name": "Enter your name"
        },
        "cta_text": {
          "primary": "Continue"
        },
        "social_providers": {
          "google": false,
          "facebook": false,
          "apple": false
        },
        "input_fields": [
          { "key": "full_name", "label": "Full Name", "type": "text", "required": true }
        ],
        "actions": {
          "primary": "submit_name",
          "secondary_google": null,
          "secondary_facebook": null,
          "secondary_apple": null,
          "tertiary": null,
          "resend_otp": null
        }
      }
    ]
  },
  "error_code": null
}


2. Get Specific Login Screen
Fetch a single login screen configuration.
Endpoint: GET /api/v1/auth/login-config/screens/:screen_type
Path Parameters:
Parameter
Type
Required
Description
screen_type
string
Yes
Screen identifier

Query Parameters:
Parameter
Type
Required
Description
platform
string
No
Filter by platform: mobile, web, all

Valid screen_type values:
screen_type
Description
welcome
Welcome/Entry Screen
create_account
Create Account (Email + Password)
phone_input
Login With Phone
phone_otp
Enter Phone OTP
email_input
Email Address
email_otp
Enter Email OTP
name_capture
What's Your Name?

Example Request:
GET /api/v1/auth/login-config/screens/phone_input

Success Response (200):
{
  "status": "success",
  "data": {
    "screen": {
      "screen_type": "phone_input",
      "title": "Login With Phone",
      "subtitle": "We'll need your phone number to send an OTP for verification.",
      "input_placeholders": {
        "country_code": "+91",
        "phone": "Enter phone number"
      },
      "cta_text": {
        "primary": "Continue"
      },
      "social_providers": {
        "google": false,
        "facebook": false,
        "apple": false
      },
      "input_fields": [
        { "key": "country_code", "label": "Country Code", "type": "text", "required": true },
        { "key": "phone", "label": "Phone Number", "type": "tel", "required": true }
      ],
      "actions": {
        "primary": "send_phone_otp",
        "secondary_google": null,
        "secondary_facebook": null,
        "secondary_apple": null,
        "tertiary": null,
        "resend_otp": null
      }
    }
  },
  "error_code": null
}

Error Response (400 - Invalid screen_type):
{
  "status": "error",
  "message": "Invalid screen type",
  "data": null,
  "error_code": "INVALID_SCREEN_TYPE"
}

Error Response (404 - Not found):
{
  "status": "error",
  "message": "Screen configuration not found",
  "data": null,
  "error_code": "SCREEN_NOT_FOUND"
}


Response Schema
Screen Configuration Object
Field
Type
Description
screen_type
string
Unique identifier for the screen
title
string | null
Main title text (editable by admin)
subtitle
string | null
Subtitle text (editable by admin)
input_placeholders
object
Placeholder text for input fields
cta_text
object
Button text labels
social_providers
object
Social login provider settings
input_fields
array
Input field definitions (not editable)
actions
object
Button action identifiers (not editable)

input_fields Object
Field
Type
Description
key
string
Field identifier (e.g., email, phone)
label
string
Field label
type
string
Input type (text, email, password, tel, number)
required
boolean
Whether field is required
length
number
Max length (for OTP fields)

cta_text Object
Field
Type
Description
primary
string | null
Main CTA button text
secondary_google
string | null
Google login button text
secondary_facebook
string | null
Facebook login button text
secondary_apple
string | null
Apple login button text
tertiary
string | null
Tertiary link text
resend_otp
string | null
Resend OTP button text

social_providers Object
Field
Type
Description
google
boolean
Enable/disable Google login
facebook
boolean
Enable/disable Facebook login
apple
boolean
Enable/disable Apple login

actions Object
Field
Action Value
Description
primary
navigate_phone
Navigate to phone input
primary
submit_signup
Submit email/password signup
primary
send_phone_otp
Send phone OTP
primary
verify_phone_otp
Verify phone OTP
primary
send_email_otp
Send email OTP
primary
verify_email_otp
Verify email OTP
primary
submit_name
Submit name
secondary_google
social_google
Trigger Google OAuth
secondary_facebook
social_facebook
Trigger Facebook OAuth
secondary_apple
social_apple
Trigger Apple OAuth
tertiary
navigate_signup
Navigate to signup
resend_otp
resend_phone_otp
Resend phone OTP
resend_otp
resend_email_otp
Resend email OTP


Screen Type Details
Screen Type
Input Fields
Primary Action
welcome
(none)
navigate_phone
create_account
email, password, confirm_password
submit_signup
phone_input
country_code, phone
send_phone_otp
phone_otp
otp
verify_phone_otp
email_input
email
send_email_otp
email_otp
otp
verify_email_otp
name_capture
full_name
submit_name


Frontend Integration Example
cURL Test Examples
# Test 1: Get all login screens
curl -s "http://localhost:5000/api/v1/auth/login-config/screens"

# Test 2: Get all screens with platform filter
curl -s "http://localhost:5000/api/v1/auth/login-config/screens?platform=mobile"

# Test 3: Get specific screen (welcome)
curl -s "http://localhost:5000/api/v1/auth/login-config/screens/welcome"

# Test 4: Get specific screen (phone_input)
curl -s "http://localhost:5000/api/v1/auth/login-config/screens/phone_input"

# Test 5: Get specific screen (phone_otp)
curl -s "http://localhost:5000/api/v1/auth/login-config/screens/phone_otp"

# Test 6: Error handling - invalid screen type
curl -s "http://localhost:5000/api/v1/auth/login-config/screens/invalid_screen"

1. App Initialization
// Fetch all login screens when app starts
const fetchLoginScreens = async () => {
  try {
    const response = await fetch('/api/v1/auth/login-config/screens?platform=mobile');
    const data = await response.json();

    if (data.status === 'success') {
      // Store screens in state/context
      return data.data.screens;
    }
  } catch (error) {
    console.error('Failed to fetch login screens:', error);
  }
};

// Create a screens map for easy access
const screensMap = screens.reduce((acc, screen) => {
  acc[screen.screen_type] = screen;
  return acc;
}, {});

2. Render Dynamic Screen
const LoginScreen = ({ screenType }) => {
  const screen = screensMap[screenType];

  if (!screen) return <Text>Screen not found</Text>;

  return (
    <View>
      {/* Title */}
      <Text style={styles.title}>{screen.title}</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>{screen.subtitle}</Text>

      {/* Input Fields */}
      {screen.input_fields.map((field) => (
        <TextInput
          key={field.key}
          placeholder={screen.input_placeholders[field.key]}
          label={field.label}
          keyboardType={field.type}
          required={field.required}
        />
      ))}

      {/* Primary CTA */}
      <Button onPress={() => handleAction(screen.actions.primary)}>
        {screen.cta_text.primary}
      </Button>

      {/* Secondary CTAs (Social) */}
      {screen.social_providers.google && (
        <Button onPress={() => handleAction(screen.actions.secondary_google)}>
          {screen.cta_text.secondary_google}
        </Button>
      )}

      {/* Tertiary Link */}
      {screen.cta_text.tertiary && (
        <Text onPress={() => handleAction(screen.actions.tertiary)}>
          {screen.cta_text.tertiary}
        </Text>
      )}
    </View>
  );
};

3. Handle Actions
const handleAction = (action) => {
  switch (action) {
    case 'navigate_phone':
      navigate('PhoneInput');
      break;
    case 'social_google':
      // Trigger Google Sign-In
      break;
    case 'send_phone_otp':
      // Call POST /api/v1/auth/phone/send-otp
      break;
    case 'verify_phone_otp':
      // Call POST /api/v1/auth/phone/verify-otp
      break;
    case 'submit_name':
      // Call POST /api/v1/auth/profile/name
      break;
    default:
      console.log('Unknown action:', action);
  }
};


Dynamic Value Substitution
For OTP screens, the subtitle may contain dynamic placeholders:
{phone} — Replace with the user's phone number
{email} — Replace with the user's email address
Example:
// If subtitle is "Please enter code we just sent to {phone}"
// And phone is "+91 98765 43210"

const displaySubtitle = screen.subtitle.replace('{phone}', userPhone);
// Result: "Please enter code we just sent to +91 98765 43210"


Error Codes
Error Code
Description
INVALID_SCREEN_TYPE
The screen_type parameter is invalid
SCREEN_NOT_FOUND
No configuration found for the requested screen
INTERNAL_ERROR
Server error


Notes
Caching: The frontend should cache the screen configurations and only refetch when needed (e.g., after admin updates).


Fallback: If the API is unavailable, the app should have hardcoded fallback text.


Input Fields: Input field definitions (input_fields) are not editable by admin — they are fixed for each screen type.


Actions: Button action identifiers are also fixed — they correspond to the backend API endpoints.


Platform Filtering: Use platform=mobile for mobile apps and platform=web for web applications.



