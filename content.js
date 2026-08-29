// NPTEL Auto-Nav Extension

let actionTaken = false;
let credentialsFilled = false;

function fillField(el, val) {
  try {
    // 1. Standard assignment
    el.value = val;
    el.setAttribute('value', val);
    
    // 2. React 15/16 hack
    let tracker = el._valueTracker;
    if (tracker) {
       tracker.setValue('');
    }

    // 3. React 16+ native setter bypass
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(el, val);
    }
  } catch (e) {
    console.error("NPTEL Auto-Nav: Error setting value natively", e);
  }
  
  // Dispatch standard events
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

function attemptAutoNav() {
  if (actionTaken) return;
  const currentUrl = window.location.href;

  // Stop completely if we are on an actual course page to prevent infinite looping
  if (currentUrl.includes('/course/')) {
    console.log('NPTEL Auto-Nav: We are on a course page. Halting auto-navigation.');
    return;
  }

  // Handle SSO Sign-in page
  if (currentUrl.includes('swayam-sso.swayam2.ac.in/signin')) {
    console.log('NPTEL Auto-Nav: On Swayam SSO page. Filling credentials...');
    
    // Very broad selectors to ensure we catch the inputs no matter what
    const emailField = document.querySelector('input[type="email"]') || 
                       document.querySelector('input[id*="email" i]') || 
                       document.querySelector('input[name*="email" i]') || 
                       document.querySelector('input[placeholder*="email" i]') || 
                       document.querySelector('input[id*="logonIdentifier" i]') ||
                       document.querySelector('input[type="text"]'); // Fallback to first text input
                       
    const passwordField = document.querySelector('input[type="password"]');
    
    if (emailField && passwordField && !credentialsFilled) {
      console.log('NPTEL Auto-Nav: Found fields, attempting to fill...');
      fillField(emailField, CONFIG.EMAIL);
      fillField(passwordField, CONFIG.PASSWORD);
      credentialsFilled = true;
      console.log('NPTEL Auto-Nav: Credentials filled successfully.');
    } else if (!credentialsFilled) {
      console.log('NPTEL Auto-Nav: Still searching for Email and Password fields...', emailField, passwordField);
    }

    // Check if captcha is solved. 
    // Cloudflare Turnstile injects a hidden input with name="cf-turnstile-response"
    const turnstileResponse = document.querySelector('input[name="cf-turnstile-response"]');
    
    // Find the Sign In button
    const signinBtn = Array.from(document.querySelectorAll('button')).find(el => {
      const text = el.textContent.trim().toLowerCase();
      return text === 'sign in' || text === 'login';
    });

    if (signinBtn && credentialsFilled) {
      const hasTurnstileContainer = document.querySelector('.cf-turnstile') || document.querySelector('iframe[src*="cloudflare"]');
      
      // If we detect turnstile, only click when the token is present
      if (hasTurnstileContainer || turnstileResponse) {
         if (turnstileResponse && turnstileResponse.value.length > 0) {
            console.log('NPTEL Auto-Nav: Captcha solved. Clicking Sign In.');
            actionTaken = true;
            signinBtn.click();
         } else {
            console.log('NPTEL Auto-Nav: Waiting for Captcha to be solved...');
         }
      } else {
         // If no turnstile found, just click if the button is not disabled
         if (!signinBtn.disabled) {
            console.log('NPTEL Auto-Nav: No captcha found, clicking Sign In.');
            actionTaken = true;
            signinBtn.click();
         }
      }
    }
    return;
  }

  // Original logic for clicking login on other domains (NPTEL, Swayam Home, etc)
  const loginBtn = Array.from(document.querySelectorAll('a, button, div.login, div.sign-in')).find(el => {
    const text = el.textContent.trim().toLowerCase();
    if (text.length > 30) return false;
    return text === 'login' || 
           text === 'log in' || 
           text === 'sign in' || 
           text === 'sign-in' ||
           text === 'sign-in / register';
  });

  if (loginBtn) {
    console.log('NPTEL Auto-Nav: Found Login button on non-SSO page. Clicking it.');
    actionTaken = true;
    loginBtn.click();
    return;
  }

  // 3. Auto-nav for NPTEL e-learning page (Click profile -> My Courses)
  // We ONLY run this on the e-learning homepage so we don't accidentally click it again inside a specific course!
  if (currentUrl.includes('onlinecourses.nptel.ac.in/e-learning')) {
    
    // First, check if 'My courses' or 'My Courses' link is already visible
    const myCoursesLink = Array.from(document.querySelectorAll('a, div, span, li')).find(el => 
      el.textContent.trim().toLowerCase() === 'my courses' && el.offsetParent !== null
    );

    if (myCoursesLink) {
      console.log('NPTEL Auto-Nav: Clicking My Courses link.');
      actionTaken = true;
      myCoursesLink.click();
      return;
    }

    // If 'My courses' is not visible, look for the 'AM' profile button
    const profileBtn = Array.from(document.querySelectorAll('button')).find(el => {
      // It has text 'AM' and usually aria-haspopup="menu"
      return el.textContent.trim() === 'AM';
    });

    if (profileBtn) {
      const isExpanded = profileBtn.getAttribute('aria-expanded') === 'true' || profileBtn.getAttribute('data-state') === 'open';
      if (!isExpanded) {
        console.log('NPTEL Auto-Nav: Found profile button. Dispatching mouse events to open dropdown.');
        
        // Modern UI frameworks (like Radix UI) often need mousedown or pointerdown instead of just a click
        profileBtn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        profileBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        profileBtn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        profileBtn.click();
        
        // We do not set actionTaken to true yet, so the script will run again in 500ms and click 'My Courses'
      }
      return;
    }
  }

  // 4. Auto-nav for Swayam dashboard (Click Go To Course)
  if (currentUrl.includes('swayam.gov.in/nc_details/NPTEL') || currentUrl.includes('swayam.gov.in/mycourses')) {
    const goToCourseBtn = Array.from(document.querySelectorAll('a, button, div')).find(el => 
      el.textContent.trim().toLowerCase() === 'go to course'
    );
    
    if (goToCourseBtn) {
      console.log('NPTEL Auto-Nav: Clicking Go To Course.');
      actionTaken = true;
      goToCourseBtn.click();
      return;
    }
  }

  // 5. Auto-nav for Moovit
  if (currentUrl.includes('moovitol.vit.ac.in/my/courses.php') || currentUrl.includes('moovitol.vit.ac.in/my/')) {
    const courseLinks = Array.from(document.querySelectorAll('a[href*="course/view.php?id="]'));
    const uniqueCourseUrls = [...new Set(courseLinks.map(a => a.href))];
    
    if (uniqueCourseUrls.length === 1) {
      console.log('NPTEL Auto-Nav: Found exactly one course. Opening it.');
      actionTaken = true;
      window.location.href = uniqueCourseUrls[0];
      return;
    } else {
      // Fallback: look for generic cards
      const cards = document.querySelectorAll('.card.dashboard-card, .coursebox');
      if (cards.length === 1) {
        const link = cards[0].querySelector('a');
        if (link) {
          console.log('NPTEL Auto-Nav: Found exactly one course card. Opening it.');
          actionTaken = true;
          link.click();
          return;
        }
      }
    }
  }
}

// Run immediately
attemptAutoNav();

// Keep checking periodically. Useful for waiting on captcha or dynamically loaded elements.
const interval = setInterval(() => {
  if (actionTaken) {
    clearInterval(interval);
    return;
  }
  attemptAutoNav();
}, 500);
