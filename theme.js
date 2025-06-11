
        const storageKey = 'theme-preference'

const onClick = () => {
  // flip current value
  theme.value = theme.value === 'light'
    ? 'dark'
    : 'light'

  setPreference()
}

const getColorPreference = () => {
  if (localStorage.getItem(storageKey))
    return localStorage.getItem(storageKey)
  else
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
}

const setPreference = () => {
  localStorage.setItem(storageKey, theme.value)
  reflectPreference()
}

const reflectPreference = () => {
  document.firstElementChild
    .setAttribute('data-theme', theme.value)

  document
    .querySelector('#theme-toggle')
    ?.setAttribute('aria-label', theme.value)
}

const theme = {
  value: getColorPreference(),
}

// set early so no page flashes / CSS is made aware
reflectPreference()

window.onload = () => {
  // set on load so screen readers can see latest value on the button
  reflectPreference()

  // now this script can find and listen for clicks on the control
  document
    .querySelector('#theme-toggle')
    .addEventListener('click', onClick)
}

// sync with system changes
window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', ({matches:isDark}) => {
    theme.value = isDark ? 'dark' : 'light'
    setPreference()
  })

  /*this part is to fetch the live contributions number from github instead of the static 153 inside my github heatmap */
  document.addEventListener('DOMContentLoaded', async () => {
    const contributionsElement = document.getElementById('contributions-text');
    const githubUsername = 'sammymallya'; // Replace with your GitHub username

    try {
        // Call your Netlify Function
        const response = await fetch(`/.netlify/functions/get-contributions?username=${githubUsername}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.totalContributions !== undefined) {
            contributionsElement.textContent = `${data.totalContributions} contributions in the last year`;
        } else {
            contributionsElement.textContent = 'Failed to load contributions.';
        }
    } catch (error) {
        console.error('Error fetching contributions:', error);
        contributionsElement.textContent = 'Error loading contributions.';
    }
});