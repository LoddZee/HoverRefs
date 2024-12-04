let currentHrefBox = null;

const showHrefBox = (link) => {
  const hrefBox = document.createElement("div");

  // Check if the href is a relative link
  let displayHref = link.getAttribute('href'); // Get the original href value

  // If the href is a relative link, we only show the relative part
  if (link.hostname === window.location.hostname) {
    // If it's an internal link, show the relative part
    displayHref = link.getAttribute('href');
  } else {
    // If it's an external link, show the full URL
    displayHref = link.href;
  }

  if (displayHref === "#" || displayHref === "") return;

  const pageUrl = window.location.pathname; // Gets the path from the current URL
  const segments = pageUrl.split('/'); // Split the path into segments
  // Return the slug up to the last part (excluding trailing segment if it exists)
  const pageSlug = '/' + segments.slice(1, -1).join('/');

  const pageSlugSegments = pageSlug.split('/');
  const displayHrefSegments = displayHref.split('/');

  // Find the first difference
  let i = 0;
  while (i < displayHrefSegments.length && i < pageSlugSegments.length 
    && displayHrefSegments[i] === pageSlugSegments[i]) {
      i++;
  }

  displayHref = '/' + displayHrefSegments.slice(i).join('/');

  const questionIndex = displayHref.indexOf('?');
  const hashIndex = displayHref.indexOf('#');

  // If both characters exist and '?' comes before '#'
  if (questionIndex !== -1) {
    if (hashIndex !== -1 && questionIndex < hashIndex) {
      // Remove everything between '?' and '#', keeping the '#' and everything after
      displayHref = displayHref.slice(0, questionIndex) + displayHref.slice(hashIndex);
    } else {
      displayHref = displayHref.slice(0, questionIndex);
    }
  }

  if (displayHref === "/") { displayHref = "Home"; }

  hrefBox.textContent = displayHref;

  // Style the box
  hrefBox.style.position = "absolute";
  hrefBox.style.backgroundColor = "rgba(0, 0, 0, 1)";
  hrefBox.style.border = "1px #fff solid";
  hrefBox.style.color = "white";
  hrefBox.style.padding = "2px 5px";
  hrefBox.style.borderRadius = "4px";
  hrefBox.style.fontSize = "16px";
  hrefBox.style.fontFamily = '"Roboto", sans-serif';
  hrefBox.style.pointerEvents = "none";
  hrefBox.style.zIndex = "1000";
  hrefBox.style.whiteSpace = "nowrap";
  hrefBox.style.transform = "translateY(-1px)";
  hrefBox.style.opacity = "1";

  // Get link position and window dimensions
  const rect = link.getBoundingClientRect();
  let topPosition = rect.top - 25;
  let leftPosition = rect.left;

  // Get the window's width and height
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Prevent the box from going off the top of the page
  if (topPosition < 0) {
    topPosition = rect.bottom + 5; // Position it below the link if it goes off the top
  }

  // Prevent the box from going off the bottom of the page
  const boxHeight = hrefBox.offsetHeight; // Height after rendering
  if (topPosition + boxHeight > windowHeight) {
    topPosition = windowHeight - boxHeight - 5; // Position it above the link if it's going off the bottom
  }

  // Append the box to the body to calculate the width
  document.body.appendChild(hrefBox);

  // Now that the box is rendered, we can get the correct width
  const boxWidth = hrefBox.offsetWidth;

  // Prevent the box from going off the right of the page
  if (leftPosition + boxWidth > windowWidth) {
    leftPosition = windowWidth - boxWidth - 20; // Position it to the left if it's going off the right
  }

  // Apply the final calculated positions
  hrefBox.style.top = `${window.scrollY + topPosition}px`;
  hrefBox.style.left = `${window.scrollX + leftPosition}px`;

  currentHrefBox = hrefBox;

  // Update position dynamically when scrolling or resizing
  const updatePosition = () => {
    const updatedRect = link.getBoundingClientRect();
    let newTopPosition = updatedRect.top - 25;
    let newLeftPosition = updatedRect.left;

    if (newTopPosition < 0) {
      newTopPosition = updatedRect.bottom + 5;
    }

    // Update width of the box after resize or scrolling
    const updatedBoxWidth = hrefBox.offsetWidth + 10;

    // Prevent the box from going off the right of the page
    if (newLeftPosition + updatedBoxWidth > windowWidth) {
      newLeftPosition = windowWidth - updatedBoxWidth - 5;
    }

    if (newTopPosition + boxHeight > windowHeight) {
      newTopPosition = windowHeight - boxHeight - 5;
    }

    hrefBox.style.top = `${window.scrollY + newTopPosition}px`;
    hrefBox.style.left = `${window.scrollX + newLeftPosition}px`;
  };

  window.addEventListener("scroll", updatePosition);
  window.addEventListener("resize", updatePosition);

  // Cleanup listener
  link.addEventListener("mouseleave", () => {
    hrefBox.remove();
    currentHrefBox = null;
    window.removeEventListener("scroll", updatePosition);
    window.removeEventListener("resize", updatePosition);
  });
};

const enableHrefHover = () => {
  document.querySelectorAll("a").forEach((link) => {
    link.addEventListener("mouseenter", () => {
      if (!currentHrefBox) showHrefBox(link);
    });
  });
};

chrome.runtime.onMessage.addListener((message) => {
  if (message.activate) {
    enableHrefHover();
  }
});
