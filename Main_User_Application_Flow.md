SPORTBOOK — COMPLETE END-TO-END FUNCTIONAL FLOW ANALYSIS

PART 1 — HOME SCREEN FLOW
MODULE: HOME
Entry Point: The Home screen is the default landing screen after the user completes onboarding/login. It is also accessible at any time via the Home icon (house icon) on the bottom navigation bar.

INITIAL SCREEN — What the User Sees Immediately
When the user lands on the Home screen, they see a dark-themed mobile interface with the following layout from top to bottom:
Top Bar / Header Section:
* On the top left, the user sees their location indicator displaying "Vadgaon khurd, Nanded Fata, Pandurang" with a small location pin icon. This is a tappable element.
* On the top right, there is a profile avatar / icon which serves as access to the user's profile.
* Below the location, the user sees a search bar with placeholder text "Search grounds, event, coaches" — this is tappable and leads to the Search/Explore module.
Category Filter Strip (Horizontal Scroll): Immediately below the search bar is a horizontally scrollable row of sport/activity category chips:
* You (personalized)
* All
* Gym
* Cycling
* Football
* More (expandable)
The user can tap any chip to filter the home feed. The selected chip is highlighted. Swiping left reveals more categories.
Live Events Banner Section: Below the category strip, the user sees a prominent Live Events badge/counter showing "12 Nearby Live Events Players" — indicating real-time activity happening near the user.
Sponsored Venue Cards (Vertical Scroll): The main body of the home screen consists of a vertically scrollable feed of venue/activity cards. Each card is a Sponsored listing displaying:
* A star rating badge (e.g., 4.8)
* Venue name (e.g., "Victory Football Arena")
* Venue type descriptor (e.g., "5 vs 5 Turf · Floodlights")
* Distance from user (e.g., "0.5KM")
* A "Tap to view details" label — the entire card is tappable
Multiple such cards are stacked and the user scrolls down to see more. All visible cards in the screenshot show "Victory Football Arena" as Sponsored placeholders.
Activity Feed / Social Feed Section: Scrolling further down, the home feed transitions into a social activity feed showing:
* Friend activity cards — e.g., "Rahul — Played Volleyball" with location "Koregaon Park · 12Km" and interaction counters (10 likes, 122 comments)
* Sponsored fitness business banners — e.g., "Fitness Hub, Koregaon Park — Flat 20% OFF Monthly Pass" with a "Book Now" button and "20% OFF" badge
* Suggested Follows section — "Suggested for You — See All" with follow cards for entities like "Nike Football (Soccer) — Popular — Follow"
* Recommended Events section — "Recommended for you — See All" showing event cards like:
    * Volleyball — "Tennis Tournament, Koregaon Park 2.3Km, 14/16 Joined — Join Team"
    * Basketball — "Basketball Tournament, Koregaon Park 2.3Km, 14/16 Joined — Join Team"
* Events Near You section — "Events Near You — See All" showing:
    * "5K Fun Run — Sat, Feb 15 — Koregaon Park — 234 Joining"
    * "Tennis Workshop — Sat, Feb 15 — Koregaon Park — 23 Joining"
Days Streak Widget: Near the bottom of the home feed (before the bottom nav), the user sees a 7-day streak tracker displayed as a horizontal row of days: Sun Mon Tue Wed Thu Fri Sat — with filled/unfilled indicators showing which days the user has been active. This is a motivational gamification element.

ALL POSSIBLE USER ACTIONS ON HOME SCREEN
1. Tapping the Location Indicator (Top Left)
* The user taps "Vadgaon khurd, Nanded Fata, Pandurang"
* A location picker or map selector opens, allowing the user to change their current location for localized search results.
2. Tapping the Search Bar
* User taps "Search grounds, event, coaches"
* The app navigates to the Search/Explore Module (detailed in Part 3)
3. Tapping a Category Chip (All / Gym / Cycling / Football / More)
* The home feed instantly filters to show only venues, events, and activities matching that category
* The tapped chip becomes highlighted/selected
* Tapping "More" expands a dropdown or full list of available categories
4. Tapping a Sponsored Venue Card
* User taps any venue card (e.g., "Victory Football Arena")
* App navigates to the Venue Detail Screen (part of Turf Booking module — detailed in Part 4)
* The detail screen shows full venue info, amenities, pricing, and booking options
5. Tapping a Friend Activity Card (e.g., "Rahul — Played Volleyball")
* User sees what their connections/friends have been playing
* Tapping the card may open that friend's profile or the activity/event detail
6. Tapping "Book Now" on a Sponsored Fitness Hub Banner
* Navigates directly to the booking flow for that specific venue/service
7. Tapping "See All" next to "Suggested for You"
* Opens a full list of suggested profiles/pages to follow
8. Tapping "Follow" on a Suggested Page Card
* Instantly follows that page/entity
* Button state changes to "Following"
9. Tapping an Event Recommendation Card (e.g., "Tennis Tournament — Join Team")
* Opens the event detail screen
* User can view participants, location, and join the team/event
10. Tapping "Join Team" button directly on a card
* Initiates a join request or directly adds the user to that team/event
* A confirmation or success state appears
11. Tapping "See All" next to "Events Near You"
* Opens a full events listing screen filtered to nearby events
12. Tapping an Event (e.g., "5K Fun Run")
* Opens the event detail screen showing date, venue, participant count, and a join option
13. Tapping the Days Streak Widget
* May navigate to the Progress/Gamification Module showing full streak history
14. Scrolling Behavior
* The home feed is fully vertically scrollable
* As the user scrolls down, more venue cards, social posts, sponsored banners, and event cards are loaded
* Pull-to-refresh gesture at the top reloads the entire feed

BOTTOM NAVIGATION BAR
The bottom navigation bar is persistent across the entire app and contains 5 tabs:
Icon	Label	Destination
House icon	Home	Home feed (current screen)
Magnifier icon	Search	Search/Explore module
Plus icon	Post	Create post/story/reel/live
Map pin icon	Map	Map view of nearby venues
Wallet icon	Wallet	Wallet & Coins module
Tapping any of these navigates to the respective module. The currently active tab is visually highlighted.

PART 2 — ONBOARDING & PREFERENCE FLOW
MODULE: ONBOARDING / PREFERENCE SETUP
Entry Point: Shown to new users after account creation, before reaching the Home screen. Also potentially accessible from profile settings.

SCREEN 1 — Activity Intensity Preference
The user sees a preference selection screen asking: "Preferred activity intensity"
Three options are displayed as selectable chips or buttons:
* Light
* Moderate
* High
The user taps one to select their preferred workout/activity intensity. The selected option is highlighted.

SCREEN 2 — Activity Frequency Preference
The screen asks: "How often do you like to participate in activities?"
Three options:
* Daily
* Weekly
* Occasionally
User taps one option.

SCREEN 3 — Group Preference
The screen asks: "How do you usually prefer to join activities?"
Three options:
* Solo
* Group
* Both
User taps one option.

SCREEN 4 — Cultural Events Preference
The screen asks: "Do you enjoy regional or cultural events?"
Three options:
* Yes
* Sometimes
* Not Much
User taps one option.
After completing all preference screens, the app uses these responses to personalize the Home feed, event recommendations, and activity suggestions. The user is then taken to the Home screen.

PART 3 — SEARCH / EXPLORE MODULE
MODULE: SEARCH & EXPLORE
Entry Point:
* Tapping the Search bar on the Home screen
* Tapping the Search (magnifier) icon on the bottom navigation bar

INITIAL SCREEN — Search Home
When the user opens Search, they see:
Top Section:
* A back arrow (top left) to return to Home
* An active search input field showing the user's location (e.g., "Nanded Fata")
* The keyboard may auto-open
Categories Strip: A horizontally scrollable row of category filters:
* Sports
* Fitness
* Adventure
* Coaching
* Events
Each is a tappable chip. Tapping a category filters the results.
Trending Now Section: Below categories, the user sees "Trending Now" with a horizontally scrollable list of trending tags/keywords displayed as pills:
* CrossFit
* Running clubs
* Hot yoga
* Boxing
* Padel
Tapping any trending tag auto-fills the search bar and shows results for that keyword.
Recent Searches Section: Below trending, the user sees "Recent Searches" displaying the user's past search queries:
* "Yoga near me"
* "Tennis courts"
* "Personal trainer"
* "Swimming Pool"
Tapping any recent search re-runs that search instantly.

AFTER TYPING / SEARCH RESULTS STATE
After the user types a query or taps a category/trending tag, the screen transitions to show results:
Results Header:
* "5 results found" — count displayed
* Toggle buttons: List | Map — user can switch between list view and map view of results
Result Cards (List View): Each result card displays:
* A banner/thumbnail image
* Activity/venue name (e.g., "Sunset Yoga Session")
* Star rating (e.g., 4.8) with review count (e.g., 231 reviews)
* Distance (e.g., 25 Km)
* Status badge — "Open Now" (green) or closed
* Price (e.g., "₹3,600 per session")
* "Book Now" button — tappable CTA
Example results shown:
1. Sunset Yoga Session — 4.8 (231) — Banner — 25 Km — Open Now — ₹3,600 per session — Book Now
2. Weekend Tennis Training — 5.0 (231) — Wakad — 14 Km — Open Now — ₹2,000 per session — Book Now
Tapping a Result Card:
* Opens the Venue/Service Detail Screen (Turf/Activity Booking flow)
Tapping "Book Now" directly:
* Skips directly to the Booking/Availability selection screen
Switching to Map View:
* Tapping "Map" toggle switches the results display to a map with pinned markers for each result
* User can pan and zoom the map
* Tapping a pin shows a mini card for that venue
Live Results Badge: A "Live" badge appears on search results that have active live sessions happening at that moment.

PART 4 — TURF / VENUE BOOKING MODULE
MODULE: TURF / VENUE BOOKING
Entry Point:
* Tapping a venue card from Home feed
* Tapping "Book Now" from Search results
* Tapping a venue pin on the Map screen

SCREEN 1 — MAP VIEW (Venue Discovery via Map)
When user taps the Map tab in the bottom navigation:
Top Section:
* Search bar at top
* Horizontal category filter strip: All | Football | Cricket | Hockey | More
Map Body:
* An interactive map showing the user's current area
* Venue pins are dropped on the map
Bottom Sheet / List Below Map: A scrollable list of venues overlaid at the bottom showing cards with:
* Activity type icon
* Venue name (e.g., "Elite Football Arena")
* Availability status — "Available"
* Banner thumbnail
* Distance (e.g., 25 Km)
* Star rating (e.g., 5.0)
* Price per session (e.g., "₹350/session" or "₹550/session")
Example venues listed:
* Elite Football Arena — Available — 25 Km — 5.0 — ₹350/session
* City Hockey — Available — 25 Km — 5.0
* Tennis Academy — Available — 25 Km — 5.0 — ₹550/session
* Greenfield Cricket Ground — Available — 25 Km — 5.0
Tapping a Venue Card from Map View:
* Navigates to the Venue Detail Screen

SCREEN 2 — VENUE DETAIL SCREEN
After tapping a venue, the user lands on the full detail screen:
Header:
* "Live Now" badge — if a session is actively happening
* Back arrow (top left) to return to previous screen
* Venue name — e.g., "Elite Football Arena"
* Tags — e.g., "Football", "Verified", "Safety Checked"
* Star rating — e.g., 5.0
About Section:
* A text description of the venue — e.g., "Elite Football Academy offers structured training sessions led by certified coaches. Our programs focus on improving skills, fitness, teamwork, and match awareness in a safe and professional environment."
* A "Read More" link that expands the full description if truncated
Amenities Section: A horizontal row of amenity icons with labels:
* Parking
* Free WiFi
* Lockers
* Air Con
* Showers
* Equipment
* Cafe
* First Aid
Each icon is visual-only (informational).
Pricing Section:
* Base price: ₹1,200 per hour
* Total: ₹1,000 per hour
* Membership discount: ₹200 (shown as a deduction)
Location Section:
* Address text — e.g., "123 Sport Avenue, Downtown District"
* A tappable map preview that opens navigation
Calendar / Availability Preview:
* Shows "Today 3:00 PM — 4 Slots" remaining
* This is a quick availability indicator
Coach/Trainer Section:
* Labeled "Sport Management Trainer"
* A "View Profile" button — navigates to the Provider/Coach Profile Screen
Cancellation Policy:
* Text describing the cancellation terms (expandable)
Bottom Action Buttons: Three primary action buttons at the bottom:
* "Join Live" — joins an active live session happening now
* "Book Now" — initiates the booking flow (navigates to Availability Selection)

SCREEN 3 — PROVIDER / COACH PROFILE SCREEN
Accessed by tapping "View Profile" on the Venue Detail screen.
Header:
* Profile photo
* Coach name — e.g., "Marcus Johnson"
* Title — "Certified personal trainer & nutrition coach"
* Role badge — "Fitness Coach"
* Location — "Mumbai, India"
* "Verified Provider" badge — "Identity & credentials verified by our team"
Services Offered Section: A list of service cards, each showing:
* Personal Training — "1-on-1 customized workout sessions"
* Group Classes — "HIIT, Yoga & Strength training"
* Live Sessions — "Interactive online coaching"
* Nutrition Plans — "Custom diet & meal planning"
Each service card is tappable — tapping may open booking for that specific service.
Ratings & Reviews Section:
* Overall rating — 4.8 out of 5
* Based on 248 reviews
* A featured review displayed — e.g., "Marcus completely transformed my fitness journey. His expertise and motivation helped me lose 15kg in 4 months!" — Priya S.
Live Stream History Section:
* "Live stream history — View All" header
* Cards showing past live sessions:
    * "Morning HIIT Burn — Full Body — Jan 28 — 45:30 duration — 45 viewers"
    * "Sunrise Yoga Flow — Jan 25 — 25:30 duration — 125 viewers"
    * Another HIIT session card
Tapping "View All" opens the complete stream history. Tapping a session card may replay a recorded session.
Navigation:
* Back arrow returns to the Venue Detail screen

SCREEN 4 — AVAILABILITY SELECTION SCREEN
Accessed by tapping "Book Now" on the Venue Detail screen.
Header:
* "Availability selection" title
* Back arrow
Calendar Section:
* A full monthly calendar view showing January 2026
* Dates are displayed in a 7-column grid (Sun–Sat)
* User taps a date to select it — selected date is highlighted
* Unavailable dates appear greyed out
Duration Selection: Three duration chips below the calendar:
* 30 min
* 60 min
* 90 min
User taps one chip to select session duration.
Available Slots Section: After selecting a date and duration, available time slots appear as a grid:
* 6:00 PM to 7:00 PM
* 7:00 PM to 8:00 PM
* 8:00 PM to 9:00 PM
* 9:00 PM to 10:00 PM
* 11:00 PM to 12:00 PM
* 12:00 PM to 1:00 PM
Each slot is a tappable button. Unavailable slots are greyed out.
Availability Indicator:
* "Availability: 3/6 Slots remaining" — shows scarcity to encourage urgency
Continue Button:
* After selecting a date, duration, and slot, the "Continue" button activates and the user taps it to proceed to Booking Details.

SCREEN 5 — BOOKING DETAILS SCREEN
Header:
* "Booking Details" title
* Back arrow
Summary Block:
* Activity type — e.g., "Football"
* Venue name — "Elite Football Arena"
* Date & time — "Feb 15, 2026 — 7:00 PM to 8:00 PM"
* Hall/court — "Sport Arena Hall"
Participants Section:
* "Number of Players" label
* Player slots displayed as circular avatars with names:
    * "Rohan R — Player 1"
    * "Karan Y — Player 2"
* User can add or remove players by tapping the + icon or player avatars
Special Instructions Field:
* Optional text input field — "Any special requirements or requests..."
* User types any specific needs
Equipment Add-On Section:
* "Equipment Add-on — See all" header
* Horizontally scrollable equipment cards, each showing:
    * Equipment name (e.g., "Football", "Goalkeeper Gloves", "Football Shoes", "Cones")
    * Star rating (4.8)
    * Description (e.g., "Good quality football for practice & matches")
    * Price (e.g., ₹1,200, ₹899, ₹2,900, ₹399)
    * "Buy Now" button
Tapping "Buy Now" adds the equipment to the booking order. Tapping "See all" opens a full equipment catalog.
Terms Agreement:
* Checkbox — "I agree to the Terms & Conditions and Cancellation Policy"
* User must check this before proceeding
Continue Button:
* Activates once all required fields are filled and terms are accepted
* Tapping navigates to the Review & Pay screen

SCREEN 6 — REVIEW & PAY SCREEN
Header:
* "Review & pay" title
* Back arrow
Booking Summary Card:
* Activity: "Football Court"
* Venue: "Sports Arena Hall A"
* Status: "Confirmed" (pre-confirmation display)
* DATE: Feb 15, 2026
* TIME: 6:00PM–7:00PM
* DURATION: 60 min
* PARTICIPANTS: 2 People
Price Breakdown Section:
* Base Price: ₹200.00
* Premium Racket add-on: +₹500.00
* Towel & water bottle: +₹100.00
* Taxes & Fees: ₹28.00
* Subtotal visible before discounts
Apply Rewards Section: Three reward deduction options:
1. Gold Coins
    * "150 Available — Max 10% Discount"
    * Auto-applied deduction: -₹20.00
    * Toggle to enable/disable
2. Diamond Coins
    * "75 Available — Full usage allowed"
    * Applied deduction: -₹20.00 (separate line showing -₹60.00 for Gold Coins total)
    * Toggle to enable/disable
Promo Code Section:
* Text input — "ENTER PROMO CODE"
* "Apply" button
* User types a promo code and taps Apply to validate and deduct discount
Total Payable:
* Total: ₹600.00 (after all discounts)
* "Total Payable amount ₹600.00" shown prominently
Security Note:
* "Secure payment powered by trusted providers" label for trust
Proceed to Payment Button:
* Large CTA at the bottom — "Proceed to payment"
* Tapping navigates to the Payment Screen

SCREEN 7 — PAYMENT SCREEN
Header:
* "Payment" title
* Back arrow
Amount Display:
* "AMOUNT PAYABLE — ₹600.00" displayed prominently
Payment Method Selection: User sees four payment options:
1. Diamond Coins — "Full value applicable — 75 Coins"
2. Gold Coins — "Auto-capped at 10% — 150 Coins"
3. Wallet — "Pay from wallet balance — ₹600.00"
4. Razorpay Gateway — "UPI, Cards, Net Banking"
User taps one method to select it. Selected method is highlighted.
Confirm Payment Button:
* "Confirm Payment" CTA
* Below it: "Paying via wallet ₹600.00" — confirmation of selected method
* Tapping this button processes the payment and navigates to the Booking Confirmed screen

SCREEN 8 — BOOKING CONFIRMED SCREEN
Full Success State:
A celebration/confirmation screen showing:
* "Booking Confirmed!" headline
* Subtext: "Your session has been successfully booked. See you on the court!"
* Activity: Football Court
* Date & Time: Feb 15, 7:00 PM
* Venue: Sport Arena Hall
* Amount Paid: ₹600.00
* Booking ID: #BK2026020801
Action Buttons:
* "Add to Card" — adds the booking as a calendar event
* "View" — navigates to the Booking Detail view
* "Continue" — returns the user to the Home screen

SCREEN 9 — BOOKING DETAIL / CONFIRMED BOOKING VIEW
Accessible from "View Details" in My Bookings or from the confirmation screen.
Progress Bar at Top: Four-step status indicator:
* Booked → Confirmed → Check-in → Completed
* Current step is highlighted
Booking Summary:
* Booking ID: #BK2026020801
* DATE, TIME, DURATION, PARTICIPANTS
Payment Details (Shown Twice — likely a design artifact):
* Amount Paid: ₹600.00
* Method: Wallet
* Transaction ID: TXN92758593
Cancellation Policy:
* "Free cancellation up to 4 hours before the booking"
* "50% refund between 2–4 hours before"
* "No refund within 2 hours of the booking"
Check-in Section:
* "Show this at the venue for Check-in"
* Check-in Code — a QR code or alphanumeric code displayed for venue staff to scan
Sport Management Trainer:
* Trainer info visible with a link to their profile
Action Buttons at Bottom:
* "Reschedule Booking" — opens the availability picker to change the date/time
* "Download Invoice" — downloads/shares a PDF invoice
* "Cancel Booking" — triggers a cancellation confirmation dialog
Cancellation Dialog (when "Cancel Booking" is tapped):
* "Cancel Booking"
* Explanation of the refund policy
* Two buttons: "Cancel Booking" (confirm) and "Keep Booking" (dismiss)

PART 5 — MY BOOKINGS MODULE
MODULE: MY BOOKINGS
Entry Point:
* From the Booking Confirmed screen — "View" button
* From the user's Profile screen
* From Notifications tapping a booking notification

INITIAL SCREEN — My Bookings (Tabbed View)
The screen has three tabs at the top:
Tab 1: UPCOMING Shows all future bookings in card format:
* Badminton Court — Sports Arena Hall A — Upcoming — DATE: Feb 15, 2026 — TIME: 6:00PM — "View Details" button
* Tennis Court — Sports Arena Hall A — Upcoming — DATE: Feb 18, 2026 — TIME: 7:00PM — "View Details" button
Tab 2: PAST Shows completed bookings:
* Swimming Pool — Aqua Center — Completed — DATE: Feb 01, 2026 — TIME: 6:00PM — "View Details"
* Yoga Studio — ZEN Wellness Hub — Completed — DATE: Jan 18, 2026 — TIME: 7:00PM — "View Details"
* Badminton Court — Sport Arena Hall B — Completed — DATE: Jan 22, 2026 — TIME: 7:00PM — "View Details"
Tab 3: CANCELLED Shows cancelled bookings:
* Football Turf — Champions Ground — Cancelled — DATE: Feb 05, 2026 — TIME: 5:00PM — "View Details"
Tapping "View Details" on any card:
* Opens the detailed Booking Detail screen for that specific booking
* For Past bookings, the action buttons at the bottom change to: "Rebook" or "Leave a Review"
* For Cancelled bookings: "Rebook" or "Contact Support"

PART 6 — LIVE STREAMING MODULE
MODULE: LIVE / SPORTS STREAMING
Entry Point:
* From Home feed — tapping a Live event card
* From the Search results — tapping a Live-badged result
* From the venue detail screen — tapping "Join Live"

LIVE MATCH SCREEN
The screen shows an active sports live stream:
Video Player Area:
* Full-width video stream of the match (e.g., "FC Barcelona vs Elite Football Arena — La Liga Match Day 28")
* "Live" badge indicator in the top corner
* Viewer count (e.g., 54 watching)
Live Chat Section: Below the video or as an overlay, a scrolling live chat feed shows real-time comments from other viewers:
Messages visible:
* "Alex — 2m ago: What a save!"
* "Jordan — 1m ago: Come on!! Let's go!"
* "Riley — 1m ago: Best match this season"
* "Sam — 45s ago: Best match this season"
* "Chris — 32s ago: Goal incoming..."
* "Alex — 2m ago: What a save!" (repeat — scrolling feed)
Chat Input:
* "Say Something" text field at the bottom
* User taps, types a message, and sends it to the live chat
* The message appears in the feed in real-time
Navigation:
* Back arrow exits the live stream and returns to the previous screen

PART 7 — PROFILE MODULE
MODULE: USER PROFILE
Entry Point:
* Tapping the profile avatar on the Home screen header
* Tapping "Profile" on the bottom navigation bar (shown as the last icon on some screens)
* Tapping own username in posts/activity feed

SCREEN 1 — OWN PROFILE SCREEN
Profile Header:
* Profile photo with camera icon overlay (tappable to change photo)
* Display name — "your-name / XYZ"
* Stats row:
    * Posts: 80
    * Followers: 23
    * Following: (number)
* Username displayed
* Bio/genre text — "Cricket / Genre text" + lorem ipsum bio
* Location — Pune, Maharashtra
* Hashtag — #hashtag
Content Tabs (horizontal tab bar):
* Posts — grid of user's posts
* Reels — video reels
* Events — events the user has joined/created
* Community — community activity
* Badges — earned gamification badges
Each tab switches the content grid below.
Posts Grid View: When on Posts tab, a 3-column grid of post thumbnails is displayed (Gym Sessions, Basketball, Tennis match, etc.). Tapping any thumbnail opens the full post.
Own Profile-Specific Buttons: Since this is the user's own profile, the action buttons shown are different from viewing others' profiles.

SCREEN 2 — OTHER USER'S PROFILE SCREEN
When viewing another user's profile (e.g., by tapping their name in activity feed):
Same header layout but with:
* "Follow" button — tapping follows this user, button changes to "Following"
* "Message" button — tapping opens a direct message conversation with this user
Team Profile Variant: Some profile screens show a Team profile with:
* "My Teams" section visible
* "Follow Team" button
* "Send Message" button
* Same content tabs: Posts, Reels, Events, Community, Badges

SCREEN 3 — EDIT PROFILE SCREEN
Entry Point: Settings > Edit Profile, or tapping an edit icon on own profile
Fields shown:
* Profile photo (tappable to change)
* NAME — text input
* BIO — text area — e.g., "Fitness enthusiast & weekend warrior. Love pushing limits on the field and in the gym."
* Sports/Interest Tags — a grid of tappable sport tags:
    * Football ✓ | Gym ✓ | Yoga ✓ | Cricket ✓
    * Basketball ✓ | Swimming ✓ | Tennis ✓ | Running ✓
User taps tags to add/remove interests.
Save Changes Button:
* Tapping "Save Changes" commits all edits and returns to the profile screen

SCREEN 4 — PRIVACY SETTINGS SCREEN
Entry Point: Settings > Privacy Control
Three privacy toggles shown as segmented selectors:
1. Profile Visibility — "Make your profile visible to everyone or keep it private" — Currently set to: Public
2. Performance Visibility — "Show your stats and rank on leaderboards" — Currently set to: Public
3. Social Visibility — "Let friends see your workout activity" — Currently set to: Private
Each setting has options: Public / Friends Only / Private (selectable)
Save Changes Button:
* Commits privacy settings

PART 8 — POST / CONTENT CREATION MODULE
MODULE: POST CREATION
Entry Point:
* Tapping the Plus (+) icon in the bottom navigation bar

SCREEN 1 — Post Type Selection
The user sees a bottom sheet or screen with four content type options:
* Story — ephemeral 24-hour content
* Post — permanent feed post
* Reel — short video
* Live — start a live stream
Tapping "Post":
* Opens the device photo gallery for media selection
* "Select Multiple" toggle visible at top
* User selects photo(s) from the grid
* Tapping "Next" proceeds to the caption screen
Caption Screen:
* Selected image shown at top
* "Add Caption here..." — text input field
* "Add location" — tappable to add a location tag
* Share button — publishes the post to the user's feed
Tapping "Story":
* Opens the Add To Story screen

SCREEN 2 — Add to Story
Camera View or Gallery:
* "Add To Story" header
* "Recent" and "Select" and "Camera" options at the bottom
* A photo grid showing recent media from the device
User selects media, then proceeds to:
Story Audience Selection Screen:
* "Your Story" — sends to all followers
* "Close Friends" — sends to a predefined close friends list
* "Circles" — a custom audience grouping feature
Circles Sub-Section: The user can choose which Circle(s) can view the story:
* Close Friends — (Member view list)
* Family — (Member view list)
* My Friends — 18 Members
* School Buddies
* Group 4 — 121 Members
* Group 5
Each circle has a "Member view list" link to see who's in it.
Create Circle Button:
* User can create a new custom circle by tapping "Create Circle"
Tabs at Bottom of Circles Screen:
* "Circles" | "Create Circle" | "Circles" — navigation within story audience management
Send Story to Users:
* After selecting audience(s), a "Send Story to Users" button finalizes and publishes the story
Tapping "Live":
* Initiates a live stream setup
* Camera preview opens
* User can add a title and start broadcasting

PART 9 — GAMIFICATION / PROGRESS MODULE
MODULE: PROGRESS, LEADERBOARD, BADGES & CHALLENGES
Entry Point:
* From Home — tapping the Days Streak widget
* From Profile — tapping the Badges tab
* Direct navigation if there's a dedicated menu item

SCREEN 1 — YOUR PROGRESS SCREEN
Header:
* Back arrow
* "Your Progress" title
Score / Rank Display:
* A large circular progress indicator showing 78% with a score
* "Great Performance!" — encouraging label
* "You're in the top 15% this week"
* "Rank #12 in your city"
Three Sub-Tabs:
* Leaderboard
* Badges
* Challenges
Current Streaks Section: Two streak trackers:
* Daily Login streak counter
* Predictions streak counter
Badges Earned (Preview):
* "BADGES EARNED — View All" header
* Four badge icons shown: First WIN | Streak King | TOP 10 (and more)
* Tapping "View All" opens the full Badges screen
Active Challenges (Preview):
* "ACTIVE CHALLENGES — View All" header
* Two challenge cards with progress:
    * "Watch 5 Live Matches — +50 pts — 3/5 progress"
    * "Predict 3 winners — +100 pts — 1/5 progress"

SCREEN 2 — LEADERBOARD SCREEN
Entry: Tapping "Leaderboard" sub-tab
Filter Tabs (Two rows): Row 1: Global | City | Category | Friends Row 2: Today | This Week | This Month
User taps combinations to filter the leaderboard.
Leaderboard List: Ranked list of users with their scores:
Rank	User	Coins
1	Rohan R	2840
2	Rhea P	2710
3	Mehir K	2655
4	Sruja Y	2500 Coins
5	Sam J	2380 Coins
You	You	2290 Coins
7	Pooja C	2067 Coins
The user's own row is highlighted distinctly.

SCREEN 3 — BADGES SCREEN
Entry: Tapping "Badges" sub-tab or "View All"
Header Stats:
* "Total Earned: 550" (coins or points from badges)
* "Active: 3" badges currently active
EARNED Badges Section: Grid of unlocked badges, each showing an icon, name, and description:
* First WIN — "Won your first prediction"
* Streak King — "7-days login streak"
* Top 10 — "Ranked in top 10"
* Super Fan — "Watched 20 live streams"
* Quick Draw — "Made a prediction under [time limit]"
LOCKED Badges Section: Badges yet to be earned, shown with lock icon and progress:
* MVP — "Reach rank #1 in your city" — Progress: Rank #12
* Iron Wall — "Complete 10 challenges" — Progress: 6/10 challenges
* Sharpshooter — "5 correct predictions in a row" — Progress: 3/5 correct
* Veteran — "Active for 30 days" — Progress: 18/30 days
* Legends — "Earn all other badges" — Progress: 5/9 Badges
Tapping a badge (earned or locked) may open a detail popup with the full description and requirements.

SCREEN 4 — CHALLENGES SCREEN
Three Sub-Tabs: ACTIVE | UPCOMING | COMPLETED
ACTIVE Tab: Currently running challenges:
* Weekend Warrior — "Watch 5 live matches this weekend" — Progress: 3/5 — Reward: +150 pts
* Prediction Pro — "Make 3 correct predictions in a row" — Progress: 1/3 — Reward: +200 pts
* Social Star — "Send 20 messages in live chat" — Progress: 12/20 — Reward: +75 pts
UPCOMING Tab: Challenges not yet started:
* Marathon Month — "Watch 30 matches in one month" — Label: "Legend" — "Starts in 3 days" — Reward: +500 pts
* Community Leader — "Invite 5 friends to join" — Label: "Recruiter" — "Starts in 1 week" — Reward: +300 pts
COMPLETED Tab: Finished challenges:
* First Steps — "Watch your first live stream" — Status: Rookie — 1/1 — +75 pts
* Getting Started — "Complete your profile" — Status: Rookie — 1/1 — +50 pts
Each active challenge has a progress bar and reward displayed. Tapping a challenge card may open its detail with more info.

PART 10 — WALLET & COINS MODULE
MODULE: WALLET
Entry Point:
* Tapping the Wallet icon on the bottom navigation bar
* From payment screen — "Pay from wallet"

INITIAL SCREEN — Wallet (Three Tabs)
Tab 1: WALLET
Balance Display:
* "Wallet Balance" — ₹2,450 (large display)
Action Buttons:
* "Add Money" — opens payment method picker to top up wallet
* "MESSAGE" — (possibly send money to another user)
Payment Method Section:
* "SELECT PAYMENT METHOD" — shows saved payment options
Transaction History: A chronological list of wallet transactions:
* Added Money — Today — +₹500
* Booked Venue — Yesterday — +₹200 (likely a refund or reward)
* Refund — 2 days ago — +₹500
* Tournament Fee — 3 days ago — +₹100 (possibly a debit shown with wrong sign — design note)
Each transaction shows: title, date, and amount (positive/negative).

Tab 2: GOLD COINS
Gold Coin Balance:
* "Gold Coin Balance: 1,250"
Usage Note:
* "How to use: Gold coins can be used up to 10% of booking price."
* "Earn gold coins by completing challenges and maintaining streaks."
Earning History:
* Challenge Completed — Today — +50
* 7-Day Streak Bonus — Yesterday — +50
* Used for Booking — 3 days ago — -30

Tab 3: DIAMONDS
Diamond Balance:
* "Diamond Balance: 340"
Usage Note:
* "Premium currency: Diamonds can be used [for] 10% of booking price."
* "Buy diamonds or earn them through premium challenges."
Diamond Packs to Purchase: Three purchase options displayed as cards:
* 100 diamonds — ₹99
* 500 diamonds — ₹449
* 1000 diamonds — ₹799 — "Popular" badge
"Buy Diamonds" Button:
* Tapping a pack then tapping "Buy Diamonds" opens the payment flow to purchase the selected diamond pack using real money (Razorpay/UPI/Cards)

PART 11 — NOTIFICATIONS MODULE
MODULE: NOTIFICATIONS
Entry Point:
* Tapping the notification bell icon (visible on various screens)
* Badge count on bell icon prompts user to tap

INITIAL SCREEN — Notifications
Three Filter Tabs:
* All — shows all notifications
* Booking — only booking-related notifications
* Payments — only payment notifications
* Systems — only system/app notifications

"All" Tab Content:
New / Unread Section:
* "XYZ has started following you — Follow Back — 4d" — social notification with a "Follow Back" CTA button
Last 7 Days Section:
* Booking Confirmed — "Your football turf session at Sports Hub is confirmed for tomorrow at [time]" — 2h ago
* Payment Successful — "₹1200 paid for badminton court booking" — 5h ago
* Payment Successful — duplicate entry — 8h ago
Last 30 Days Section:
* Booking Cancelled — "Your cricket net session on Feb 3 was cancelled. Refund Initiated." — 2w ago
* Payment Successful — ₹1200 — 3w ago

"Booking" Tab Content: Filtered view showing only booking-related notifications:
* Booking Confirmed — football turf — 2h
* Payment Successful — ₹1200 — 5h, 8h
* Booking Cancelled — cricket net — 2w
* Booking Confirmed — gym session at FitZone — Feb 1 at 7:00 AM — 2w
* Payment Successful — ₹1200 — 3w

"Payments" Tab Content: Payment-only notifications:
* Payment Successful — ₹1200 — 5h
* Refund Processed — "₹800 refunded to your wallet for cancelled booking" — 4h
* Payment Successful — ₹1200 — 4d, 3d

"Systems" Tab Content: App and system notifications:
* New Feature Available — "You can now book group activities with friends!" — 3d ago
* Profile Incomplete — "Complete your profile first to get personalized recommendations" — 1w ago
* Welcome to SportBook! — "Start exploring activities and book your first session" — 2w ago
Tapping any notification:
* Navigates to the relevant screen (e.g., tapping a booking notification opens that booking's detail; tapping a profile incomplete notification opens Edit Profile)

PART 12 — SETTINGS MODULE
MODULE: SETTINGS
Entry Point:
* From Profile screen — Settings gear icon
* From sidebar/hamburger menu

SETTINGS SCREEN
ACCOUNT Section:
* Edit Profile — "Name, email, phone" — tapping opens the Edit Profile screen
* Privacy Control — "Manage your data" — tapping opens the Privacy Settings screen
PREFERENCES Section:
* Push Notifications — "Booking reminder & updates" — toggle to enable/disable push notifications
* Email Notifications — "Weekly activity summary" — toggle to enable/disable email notifications
PAYMENTS Section:
* Payment Methods — "Manage your cards" — tapping opens a screen to add/remove/manage saved cards and UPI IDs
* Wallet — "Balance & transactions" — tapping opens the Wallet module
ACCOUNT ACTIONS Section:
* Log Out — tapping triggers a confirmation dialog
* Delete Account — tapping triggers a severe warning/confirmation dialog

Log Out Dialog: When user taps "Log Out":
* Modal popup: "Are you sure you want to log out of your account?"
* Two buttons: "Log Out" (confirm, red/destructive) and "Cancel" (dismiss)
* Confirming logs the user out and redirects to the login/splash screen

Delete Account Dialog: When user taps "Delete Account":
* Modal popup: "This action cannot be undone. This will permanently delete your account and remove all your data from our servers."
* Two buttons: "Delete Account" (confirm, red/destructive) and "Cancel" (dismiss)
* Confirming permanently deletes all user data

PART 13 — HELP & SUPPORT MODULE
MODULE: HELP & SUPPORT
Entry Point:
* From Settings screen
* From Account Unavailable screen

HELP & SUPPORT SCREEN
Header: "We're here to help! Choose an option below."
Three Support Options:
1. FAQs — "Find answers to common questions about the app"
    * Tapping opens an FAQ list with expandable Q&A accordion items
2. Contact Support — "Reach out to our friendly support team"
    * Tapping opens a contact form or chat interface with the support team
3. Report an Issue — "Let us know if something isn't working right"
    * Tapping opens the Issue Report screen
Footer Note:
* "Our support team typically responds within 24 hours"

REPORT AN ISSUE SCREEN
ISSUE CATEGORY:
* Dropdown/selector: "Select a category"
* Options: App Crash | Login Issues | Performance Bug | Payment Problem | Other
DESCRIPTION:
* Text area — "Describe the problem clearly..."
ATTACHMENT (OPTIONAL):
* "Upload a screenshot or photo" — opens file picker
* Helper text: "Include steps to reproduce the issue if possible"
Submit Issue Button:
* Submits the report to the support team

PART 14 — ACCOUNT UNAVAILABLE SCREEN
MODULE: ERROR STATE — ACCOUNT DEACTIVATED
When shown:
* When a user with a deactivated or banned account tries to log in
Screen Content:
Headline: "Account Unavailable"
Subtext: "Your account has been deactivated. This may be due to a policy violation or a deletion request made by you."
Possible Reasons (bullet list displayed):
* Community guidelines violation
* Account deletion requested by you
* Suspicious activity detected
Reassurance Text: "If you believe this was a mistake, please reach out to our support team. We're happy to help."
Two Action Buttons:
* "Contact Support" — opens Help & Support / Contact form
* "Go to Home" — redirects to the app's public/logged-out home or login screen

PART 15 — COMMUNITY / TEAMS MODULE
MODULE: COMMUNITY & TEAMS
Entry Point:
* From Home feed — community/team cards
* From Profile — Community tab
* From Search — searching for teams

TEAM/COMMUNITY PROFILE SCREEN
Header:
* Team name — "Lorem ipsum" (placeholder)
* Location — Pune, Maharashtra
* Sport — Cricket
Stats Row (4 metrics):
* 24 Members
* 24 Events
* 24 Wins
* 24 Rating
About Section:
* "A passionate cricket team focused on practice sessions, friendly matches, and local tournaments. We play, train, and grow together as a squad."
Recent Activity Section:
* "Won against City FC 3–1"
* "New member joined: Vikram T."
* "Training session completed"
Members Preview:
* "Members" section showing avatar thumbnails of team members
Content Tabs:
* Overview | Members | Activities | Events
FOLLOW TEAM Button:
* Tapping follows the team and updates the button to "Following"
Send Message:
* Tapping opens a direct message to the team's group chat or admin

PART 16 — INBOX / MESSAGING MODULE
MODULE: INBOX & DIRECT MESSAGES
Entry Point:
* Tapping "Message" button on a user/team profile
* From notification (new message alert)
* Inbox icon (if present in navigation)

INBOX SCREEN
Header:
* "Inbox" title
* Search bar — "Search Lorem Lorem Lorem" (placeholder)
* Unread message count badge — "12"
Filter Tabs:
* All | Unread | Group
Conversation List: Each conversation card shows:
* Profile avatar
* Name (e.g., Ariana, Jame, Ken, Nalli, Jenny)
* Last message preview (truncated)
* Timestamp — e.g., "7:09 pm"
Conversation examples:
* Ariana — "Nice to meet you" — 7:09 pm
* Jame — "Hey bro, do you want to play game now?" — 7:09 pm
* Ken — "I agree with your opinion" — 7:09 pm
* Nalli — "Hey bro, do you want to play game now?" — 7:09 pm
* Jenny — "Yesterday I went to Grandma's house to play with my grandchild" — 7:09 pm (repeated — scroll)
Tapping a Conversation:
* Opens the full chat thread with that user/group
* Standard messaging interface with text input, send button, media sharing

PART 17 — SUBSCRIPTION / PREMIUM MODULE
MODULE: SUBSCRIPTION / UPGRADE
Entry Point:
* Shown as an upgrade prompt/modal
* "Upgrade your Playmate Experience" screen
* From Settings or Profile — "Upgrade" CTA

SUBSCRIPTION SCREEN
Header:
* "Your ultimate sports companion for teams, stats, and competition"
* "Upgrade your Playmate Experience"
* "Enjoy 30 days of free access"
Billing Toggle:
* Monthly | Yearly tab switch
* Switching to Yearly presumably shows discounted annual pricing
Four Plan Tiers:
1. Free — ₹0/month
* 2 Teams
* 3 Events/month
* Basic Profile
* 50 coins/month
* CTA: "Choose Free"
2. Starter — ₹99/month
* 5 Teams
* 10 Events/month
* Passport Lite
* 200 coins/month
* CTA: "Choose Free" (likely "Choose Starter" — placeholder text)
3. Pro Player — ₹299/month ← "Popular" badge
* Unlimited Teams
* Unlimited Events
* AI Suggestions
* No Ads
* 800 coins/month
* CTA: "Go Pro"
4. VIP — ₹299/month (possibly higher price — placeholder)
* Everything in Pro
* VIP Passport
* AI Suggestions
* Priority Support
* 2000 coins/month
* CTA: "Unlock Premium"
Free Trial Note:
* "Get 30 days free trial."
* "Skip" link — tapping skips the upgrade and keeps the user on the free plan
Tapping any paid plan CTA:
* Opens a payment confirmation screen
* Shows billing details and payment method selection
* Confirms subscription activation

PART 18 — DAYS STREAK DETAIL MODULE
MODULE: STREAK TRACKER (Detailed View)
Entry Point:
* Tapping the streak widget on Home
* From the Progress screen

STREAK SCREEN
Calendar Display:
* Header: "Days streak"
* A weekly calendar strip — Sun Mon Tue Wed Thu Fri Sat
* Filled circles indicate days the user was active
Monthly Calendar:
* January 2026 displayed as a full grid
* Active days highlighted
* Shows the user's complete streak history for the month
Streak Progress Message:
* "5 Days to go & you will achieve 6 Coins" — motivational milestone message
This screen encourages daily app engagement by gamifying logins and activity check-ins.

PART 19 — COMPLETE END-TO-END USER JOURNEY STORY

🎯 THE COMPLETE USER JOURNEY — FROM FIRST OPEN TO ALL MODULES

CHAPTER 1 — FIRST LAUNCH & ONBOARDING
A new user downloads and opens SportBook for the first time. The splash screen appears, showing the app's branding and tagline: "Your ultimate sports companion for teams, stats, and competition."
The user is prompted to sign up or log in. After creating an account, the app takes them through the Onboarding Preference Flow:
→ Screen 1 asks about preferred activity intensity — the user taps "Moderate" → Screen 2 asks how often they like to participate — user taps "Weekly" → Screen 3 asks about solo vs group preference — user taps "Both" → Screen 4 asks about cultural/regional events — user taps "Sometimes"
Preferences are saved. The app transitions to the Subscription Screen offering a 30-day free trial. The user reviews the four plans (Free, Starter, Pro, VIP), decides to tap "Skip" for now, and stays on the Free plan.

CHAPTER 2 — HOME SCREEN FIRST EXPERIENCE
The user lands on the Home Screen for the first time. They see:
* Their location "Vadgaon khurd, Nanded Fata, Pandurang" at the top
* A search bar inviting them to "Search grounds, event, coaches"
* Category chips: You, All, Gym, Cycling, Football, More
* A "12 Nearby Live Events Players" indicator
* Multiple sponsored "Victory Football Arena" venue cards
* Below: social feed with friend activity, sponsored banners, and event recommendations
The user taps the "Football" category chip. The feed instantly filters to show only football-related venues and events.
They see a Days Streak widget at the bottom of the feed and tap it. The Streak Tracker screen opens showing their login calendar for January 2026. They see the message "5 Days to go & you will achieve 6 Coins." They note the current streak and return by tapping the back arrow, landing back on Home.

CHAPTER 3 — EXPLORING THE MAP
The user taps the Map icon in the bottom navigation. The Map screen opens showing their current area with venue pins. They see a list of venues at the bottom:
* Elite Football Arena — ₹350/session
* City Hockey
* Tennis Academy — ₹550/session
* Greenfield Cricket Ground
They tap the "All" category chip, then switch to "Football" to filter. The map updates. They tap the "Elite Football Arena" card in the bottom list.

CHAPTER 4 — VENUE DETAIL & BOOKING FLOW
The Venue Detail Screen for Elite Football Arena opens. The user reads:
* "Live Now" badge — a session is active
* Verified and Safety Checked badges
* 5.0 star rating
* About section describing certified coaching
* Amenities: Parking, WiFi, Lockers, Air Con, Showers, Equipment, Cafe, First Aid
* Pricing: Base ₹1,200/hr, with membership discount bringing it to ₹1,000/hr
* Today's availability: 3:00 PM — 4 Slots
The user taps "View Profile" to check the trainer. The Marcus Johnson Coach Profile opens — they see his credentials, 4.8 rating, 248 reviews, and past live session recordings. They read Priya S.'s glowing review and feel confident. They tap the back arrow to return to the venue detail.
The user taps "Book Now". The Availability Selection Screen opens.
They see the January 2026 calendar. They tap on February 15 — it highlights. They select 60 min duration. The available slots appear — they tap 7:00 PM to 8:00 PM. The counter shows "3/6 Slots remaining." They tap Continue.
The Booking Details Screen opens. They see:
* Football at Elite Football Arena
* Feb 15, 2026 — 7:00 PM to 8:00 PM
* Sport Arena Hall
They add their friend by tapping the participants section — Rohan R (Player 1) and Karan Y (Player 2) are added. They type a special instruction: "Please keep the turf lights on for the full session."
They scroll to the Equipment Add-ons. They see:
* Football (₹1,200) — they tap "Buy Now" to add it
* Goalkeeper Gloves (₹899)
* Football Shoes (₹2,900)
* Cones (₹399) — they add the Cones too
They check the Terms & Conditions checkbox. Continue activates — they tap it.
The Review & Pay Screen opens. They see the full breakdown:
* Base Price: ₹200
* Premium Racket: +₹500
* Towel & water bottle: +₹100
* Taxes & Fees: ₹28
* Gold Coins auto-applied: -₹20
* Diamond Coins applied: -₹60 (total shown as -₹20 for this example)
They type a promo code and tap Apply — a discount is added.
Total: ₹600.00
They tap Proceed to Payment.
The Payment Screen opens. They see four options: Diamond Coins, Gold Coins, Wallet, Razorpay. They tap Wallet — "Pay from wallet balance ₹600.00." The Confirm Payment button activates. They tap it.
The Booking Confirmed celebration screen appears:
* "Booking Confirmed! Your session has been successfully booked. See you on the court!"
* Football Court — Feb 15, 7:00 PM — Sport Arena Hall — ₹600.00 — #BK2026020801
They tap "Add to Card" to save it to their phone calendar. They tap "Continue" to return to Home.

CHAPTER 5 — MANAGING BOOKINGS
From Home, the user navigates to their profile and finds My Bookings. They tap the Upcoming tab and see their new Badminton (Feb 15) and Tennis (Feb 18) bookings.
They tap "View Details" on the Football booking. The Booking Detail Screen opens showing the 4-step progress bar — currently on "Confirmed." They see the QR Check-in Code to show at the venue.
They realize they need to change the time. They tap "Reschedule Booking" — the Availability Selection screen opens again. They pick a new slot, tap Continue, and the booking is updated.
They switch to the Past tab — they see completed sessions at Swimming Pool, Yoga Studio, and Badminton Court.
They switch to the Cancelled tab — they see the Football Turf booking that was cancelled. They consider rebooking it.

CHAPTER 6 — SEARCH & DISCOVER
Back on Home, the user taps the Search bar. The Search Screen opens with:
* Categories: Sports, Fitness, Adventure, Coaching, Events
* Trending Now: CrossFit, Running clubs, Hot yoga, Boxing, Padel
* Recent Searches: Yoga near me, Tennis courts, Personal trainer, Swimming Pool
The user taps "Hot yoga" from Trending Now. Results appear:
* "5 results found"
* List and Map toggle
They see Sunset Yoga Session (4.8, 25km, ₹3,600, Open Now) and Weekend Tennis Training (5.0, 14km, ₹2,000, Open Now).
They tap "Map" toggle to see the results on a map. They spot a pin close to them, tap it — a mini card appears. They tap the card to open the full detail. They tap "Book Now" and initiate the booking flow again (following the same steps as Chapter 4).

CHAPTER 7 — WATCHING LIVE SPORTS
The user returns to Home and notices a Live Events badge. They tap it. The Live Match Screen opens showing "FC Barcelona vs Elite Football Arena — La Liga Match Day 28" streaming live with 54 viewers.
They watch the stream. The live chat is scrolling with fan messages. They tap the "Say Something" field, type "What a match!", and send it. Their message appears in the chat.
They watch for a few minutes, then tap the back arrow to return to the app.

CHAPTER 8 — PROGRESS, LEADERBOARD & BADGES
The user navigates to the Progress Screen (via the streak widget or profile). They see:
* Score: 78% — "Great Performance!"
* "You're in the top 15% this week"
* "Rank #12 in your city"
They tap the Leaderboard tab. Filtering to City > This Week, they see the ranked list. They're at rank #12 with 2290 Coins, just below Pooja C (2067) and above several others.
They tap the Badges tab. They see earned badges: First WIN, Streak King, Top 10, Super Fan, Quick Draw. They see locked badges — MVP (need rank #1), Iron Wall (6/10 challenges done), Sharpshooter (3/5 correct predictions), Veteran (18/30 days), Legends (5/9 badges).
They tap the Challenges tab — Active tab is shown:
* Weekend Warrior — 3/5 live matches — +150 pts
* Prediction Pro — 1/3 correct predictions — +200 pts
* Social Star — 12/20 live chat messages — +75 pts
They tap Upcoming tab — see Marathon Month starting in 3 days (+500 pts) and Community Leader starting in 1 week (+300 pts).
They tap Completed tab — see First Steps and Getting Started as rookie challenges they completed early.

CHAPTER 9 — SOCIAL FEATURES & PROFILE
The user taps on their Profile (avatar in header). Their profile screen opens showing:
* Name: XYZ
* Posts: 80, Followers: 23
* Bio: Cricket / Genre text
* Location: Pune, Maharashtra
They tap the Posts tab — a 3-column grid of thumbnails appears: Gym Sessions, Basketball, Tennis match content. They tap a thumbnail — the full post opens.
They tap back, then switch to the Badges tab — a visual display of their earned badges appears.
They want to post a new activity. They tap the Plus (+) icon on the bottom navigation. A menu appears:
* Story | Post | Reel | Live
They tap "Post". The gallery opens. They select a photo from their recent tennis session. They tap Next. The caption screen opens. They type "Great tennis session today! 🎾" — wait, they don't use emojis in the actual app text but the caption field allows free text. They add a location tag: "Koregaon Park." They tap Share. The post publishes to their feed.
They then tap "Story". The Add to Story screen opens with their recent photos. They select a gym photo. They tap next to reach the Audience Selection:
* Your Story (public)
* Close Friends
* Circles
They tap Circles. A list appears: Close Friends, Family, My Friends (18 members), School Buddies, Group 4 (121 members), Group 5. They select "My Friends" and tap "Send Story to Users". The story publishes.

CHAPTER 10 — MESSAGING
The user taps the Message button on a friend's profile. Or they access the Inbox directly. The Inbox shows all conversations with unread count (12 unread).
Filtering to Unread, they see messages from Jame: "Hey bro, do you want to play game now?" They tap the conversation — the chat thread opens. They type "Sure! Let's book the football turf for tomorrow" and send. They return to Inbox.

CHAPTER 11 — WALLET & COINS
The user taps the Wallet icon on the bottom navigation. The Wallet screen opens on the Wallet tab:
* Balance: ₹2,450
* Transaction history showing top-ups, bookings, refunds
They tap "Add Money" — a payment method screen opens. They add ₹500 via UPI. The balance updates to ₹2,950.
They tap the Gold Coins tab:
* Balance: 1,250 Gold Coins
* Earning history: Challenge +50, Streak Bonus +50, Booking deduction -30
* Note: usable up to 10% of booking price
They tap the Diamonds tab:
* Balance: 340 Diamonds
* They want more diamonds — they tap the 1000 diamonds — ₹799 — Popular pack
* Tap "Buy Diamonds" — payment flow opens — they complete via Razorpay
* Diamond balance updates to 1,340

CHAPTER 12 — NOTIFICATIONS
The user notices a notification badge. They tap the bell icon. The Notifications screen opens on All tab.
They see:
* New: "XYZ has started following you" with a "Follow Back" button — they tap it to follow back
* Booking Confirmed for football turf tomorrow
* Payment Successful — ₹1200 for badminton
They filter to Payments tab — see:
* Payment Successful — ₹1200
* Refund Processed — ₹800 back to wallet for cancelled booking
They filter to Systems tab — see:
* New Feature: "You can now book group activities with friends!" — they're excited
* Profile Incomplete warning — they tap it — it navigates them to Edit Profile

CHAPTER 13 — SETTINGS & ACCOUNT MANAGEMENT
The user goes to Settings from their profile. They tap Edit Profile:
* Update name
* Edit bio: "Fitness enthusiast & weekend warrior"
* Tap sport tags to add Basketball and Swimming to their interests
* Tap Save Changes
They tap Privacy Control:
* Change Performance Visibility from Public to Friends Only
* Keep Social Visibility as Private
* Tap Save Changes
They toggle off Email Notifications (don't want weekly summaries).
They tap Payment Methods — manage their saved Razorpay cards.
They tap Wallet — returns to the Wallet screen.

CHAPTER 14 — HELP & SUPPORT
The user has a question about cancellation policy. They go to Settings > Help & Support (or find it in the menu).
The screen offers: FAQs, Contact Support, Report an Issue.
They tap FAQs — browse questions about booking, payments, and cancellations.
Not finding their answer, they tap Contact Support — fill in their query and submit.
They also notice the app crashed earlier. They tap Report an Issue:
* Category: App Crash
* Description: "App crashed when I tried to open the live stream screen"
* Upload a screenshot
* Tap Submit Issue

CHAPTER 15 — COMMUNITY & TEAMS
From the Home feed, the user taps a Cricket team card in the community section. The Team Profile opens:
* Team: Lorem ipsum Cricket
* 24 Members, 24 Events, 24 Wins, 24 Rating
* Recent Activity: "Won against City FC 3–1"
They tap "Follow Team" — button changes to "Following." They tap "Send Message" — a group chat or admin DM opens.
They explore the Members tab — see all team members. They tap the Events tab — see upcoming team events. They tap the Activities tab — see match history and training logs.

CHAPTER 16 — SUBSCRIPTION UPGRADE
The user realizes they've hit the limit of 2 teams on the Free plan. A prompt appears: "Upgrade to add more teams." They tap it — the Subscription Screen opens.
They switch the toggle from Monthly to Yearly to see discounted rates. They review:
* Pro Player: ₹299/month — Unlimited Teams, Unlimited Events, AI Suggestions, No Ads, 800 coins/month
They tap "Go Pro". A payment confirmation screen opens. They pay via Razorpay. The Pro subscription activates. The "Go Pro" button changes to "Current Plan." The user's profile now shows a Pro badge.

CHAPTER 17 — LOG OUT
At the end of the session, the user goes to Settings. They scroll to Account Actions and tap "Log Out".
A confirmation dialog appears: "Are you sure you want to log out of your account?"
They tap "Log Out" — the app clears the session and returns to the Login/Splash screen.

✅ COMPLETE MODULE SUMMARY TABLE
#	Module	Entry Point	Key Actions
1	Home	Default on launch	Browse feed, filter categories, view venue cards, scroll social feed
2	Onboarding	First launch	Set activity preferences (intensity, frequency, group style, cultural events)
3	Search/Explore	Bottom nav Search	Search venues, filter by category, switch list/map view, book directly
4	Map	Bottom nav Map	Browse venue pins, filter by sport, view venue cards
5	Turf/Venue Booking	Home cards, Search, Map	View venue detail, select availability, add participants, pay, confirm
6	Coach Profile	Venue Detail > View Profile	View credentials, services, reviews, live history
7	My Bookings	Profile / Booking confirmation	View Upcoming/Past/Cancelled, view details, reschedule, cancel, download invoice
8	Live Streaming	Home live events, Venue detail	Watch live stream, participate in live chat
9	Post Creation	Bottom nav Plus	Create Post, Story (with Circles audience), Reel, or start Live stream
10	User Profile	Header avatar, activity feed	View posts/reels/events/badges, edit profile, follow, message
11	Other User Profile	Tapping user names	Follow, message, view their content tabs
12	Privacy Settings	Settings > Privacy	Control profile, performance, and social visibility
13	Progress	Streak widget, profile	View score, rank, streaks, navigate to leaderboard/badges/challenges
14	Leaderboard	Progress screen	Filter by Global/City/Category/Friends and time periods
15	Badges	Progress screen	View earned badges, see progress on locked badges
16	Challenges	Progress screen	Track active/upcoming/completed challenges, earn rewards
17	Wallet	Bottom nav Wallet	View balance, add money, view transactions
18	Gold Coins	Wallet > Gold Coins tab	View balance, earning history, use in bookings
19	Diamonds	Wallet > Diamonds tab	View balance, purchase diamond packs
20	Notifications	Bell icon	View all/booking/payment/system notifications, tap to navigate
21	Settings	Profile > Settings	Edit profile, privacy, notifications, payments, logout, delete account
22	Help & Support	Settings	FAQs, contact support, report issue
23	Account Unavailable	Login attempt (banned user)	View reason, contact support, go to home
24	Community/Teams	Home feed, search	View team profile, follow team, message, browse members/events/activities
25	Inbox/Messages	Profile > Message button	Browse conversations, read/send DMs, filter unread/groups
26	Subscription	Upgrade prompt, settings	Choose Free/Starter/Pro/VIP plan, monthly/yearly toggle, pay
27	Streak Tracker	Home streak widget	View daily/monthly activity calendar, see milestone progress
This completes the full end-to-end functional flow of the SportBook application based on all screens present in the provided PDF. Every screen, button, tab, state, dialog, and navigation path has been documented in exhaustive detail as experienced by a real user interacting with the app.