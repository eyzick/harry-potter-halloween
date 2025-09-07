# Harry Potter Halloween Party Invitation

A magical React TypeScript website for sending out Harry Potter themed Halloween party invitations with persistent RSVP data storage.

## Features

- ✨ Magical animated background with twinkling stars
- 🏰 Hogwarts crest with animated house symbols
- 📝 Interactive RSVP form with validation
- 🎨 Harry Potter themed color scheme (Gryffindor colors)
- 📱 Fully responsive design
- ⚡ Built with React 18 and TypeScript
- 🌐 **Persistent data storage** - RSVPs work across different browsers and devices
- 📊 Admin panel with real-time RSVP management
- 📧 Email notifications for RSVPs
- 📱 **Mobile admin access** - Easy URL-based admin dashboard access

## Mobile Admin Access

For easy mobile access to the admin dashboard:

### **Direct Access (No Password)**
Add `?admin=direct` to your URL:
```
https://yourusername.github.io/halloween-party/?admin=direct
```

### **Password-Protected Access**
Add `?admin=true` to your URL:
```
https://yourusername.github.io/halloween-party/?admin=true
```

### **Desktop Shortcut**
Press `Ctrl+Shift+A` to open the admin panel

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Customization

You can easily customize the party details by editing the `InvitationCard.tsx` component:

- Change the date, time, and location
- Modify the party activities list
- Update the dress code requirements
- Add or remove party details

## Data Storage System

This application includes a robust data storage system that works across different browsers and devices:

- **API Storage**: Uses JSONBin.io for persistent data storage (recommended)
- **Fallback Storage**: Automatically falls back to localStorage if API is not configured
- **Real-time Updates**: Admin panel shows live RSVP data from all users
- **Cross-browser Compatibility**: RSVPs are visible to all users regardless of browser

For detailed setup instructions, see [STORAGE_SETUP.md](./STORAGE_SETUP.md).

## Technologies Used

- React 18
- TypeScript
- CSS3 with animations
- Google Fonts (Cinzel & Cormorant Garamond)
- EmailJS for email notifications
- JSONBin.io for data persistence

## Deployment

### GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages.

#### Prerequisites
1. Push your code to a GitHub repository
2. Replace `yourusername` in `package.json` homepage field with your actual GitHub username
3. Install the gh-pages dependency: `npm install --save-dev gh-pages`

#### Automatic Deployment (Recommended)
The project includes a GitHub Actions workflow that automatically deploys to GitHub Pages when you push to the main/master branch.

1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the left sidebar
3. Under "Source", select "GitHub Actions"
4. Push your code to the main/master branch
5. The workflow will automatically build and deploy your site

#### Manual Deployment
To manually deploy to GitHub Pages:

```bash
npm run deploy
```

This will build the project and push it to the `gh-pages` branch, which GitHub Pages will serve.

### Custom Domain Setup

To use a custom domain instead of the default GitHub Pages URL:

1. **Configure DNS Records**:
   - For root domain (`yourdomain.com`): Add A records pointing to GitHub's IPs
   - For subdomain (`halloween.yourdomain.com`): Add CNAME record pointing to `username.github.io`

2. **Update GitHub Settings**:
   - Go to repository Settings → Pages
   - Enter your custom domain in the "Custom domain" field
   - Enable "Enforce HTTPS"

3. **Update Project Configuration**:
   - Replace `yourdomain.com` in `package.json` homepage field with your actual domain
   - Update the `public/CNAME` file with your domain

4. **Deploy**:
   - Push changes to trigger automatic deployment
   - Wait for DNS propagation (can take up to 48 hours)

### Local Build
To build the project for production locally:

```bash
npm run build
```

The build folder will contain the optimized production build ready for deployment to any static hosting service.

## Magical Features

- Animated Hogwarts crest with house symbols
- Glowing card borders with magical effects
- Twinkling star background
- Smooth form animations
- Responsive design for all devices

Enjoy your magical Halloween party! 🎃✨
