let lastScrollTop = 0;
const header = document.querySelector('.site-header');
const banner = document.querySelector('.banner');

window.addEventListener('scroll', function() {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop) {
    // Scroll Down
    header.classList.add('hidden');
  } else {
    // Scroll Up
    header.classList.remove('hidden');
  }

  // Add transparent background when not at the top
  if (scrollTop > 50) {
      header.classList.add('scrolled');
  } else {
      header.classList.remove('scrolled');
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling

  // Parallax effect for banner
  if (banner) {
    let scrollPosition = window.pageYOffset;
    banner.style.backgroundPositionY = scrollPosition * 0.5 + 'px'; // Adjust 0.5 to change speed
  }
});

// --- Post Listing Logic ---

document.addEventListener('DOMContentLoaded', () => {
    const postGrid = document.getElementById('post-grid');
    const paginationContainer = document.getElementById('pagination');
    const showPerPageSelect = document.getElementById('show-per-page');
    const sortBySelect = document.getElementById('sort-by');
    const postCountElement = document.querySelector('.post-count');

    // State management
    let state = {
        currentPage: 1,
        perPage: 10,
        sortBy: '-published_at',
        totalItems: 0,
        totalPages: 0,
    };

    // --- Functions ---

    // Save state to localStorage
    const saveState = () => {
        const stateToSave = {
            perPage: state.perPage,
            sortBy: state.sortBy,
        };
        localStorage.setItem('ideaPageState', JSON.stringify(stateToSave));
    };

    // Load state from localStorage
    const loadState = () => {
        const savedState = localStorage.getItem('ideaPageState');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            state.perPage = parsedState.perPage || 10;
            state.sortBy = parsedState.sortBy || '-published_at';

            // Update UI to reflect loaded state
            showPerPageSelect.value = state.perPage;
            sortBySelect.value = state.sortBy;
        }
    };
    
    // Fetch data from API
    const fetchPosts = async () => {
        const apiUrl = `/api/ideas?page[number]=${state.currentPage}&page[size]=${state.perPage}&append[]=small_image&append[]=medium_image&sort=${state.sortBy}`;
        
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            state.totalItems = data.meta.total;
            state.totalPages = data.meta.last_page;
            renderPosts(data.data);
            renderPagination();
            updatePostCount();
        } catch (error) {
            console.error("Could not fetch posts:", error);
            postGrid.innerHTML = '<p>Error loading posts. Please try again later.</p>';
        }
    };

    // Render posts to the grid
    const renderPosts = (posts) => {
        postGrid.innerHTML = '';
        if (posts.length === 0) {
            postGrid.innerHTML = '<p>No posts found.</p>';
            return;
        }

        posts.forEach(post => {
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            
            // Format date
            const postDate = new Date(post.published_at);
            const formattedDate = `${postDate.getDate()} ${postDate.toLocaleString('default', { month: 'long' })} ${postDate.getFullYear()}`;

            postCard.innerHTML = `
                <img src="${post.small_image[0]?.url || 'https://via.placeholder.com/300x200'}" alt="${post.title}" class="thumbnail" loading="lazy">
                <div class="post-card-content">
                    <p class="post-card-date">${formattedDate}</p>
                    <h3 class="post-card-title">${post.title}</h3>
                </div>
            `;
            postGrid.appendChild(postCard);
        });
    };

    // Render pagination controls
    const renderPagination = () => {
        paginationContainer.innerHTML = '';

        const prevButton = document.createElement('button');
        prevButton.innerHTML = '&laquo;';
        prevButton.disabled = state.currentPage === 1;
        prevButton.addEventListener('click', () => {
            state.currentPage--;
            fetchPosts();
        });
        paginationContainer.appendChild(prevButton);

        // Simple pagination: show current page and total pages
        const pageInfo = document.createElement('button');
        pageInfo.textContent = `${state.currentPage}`;
        pageInfo.className = 'active';
        paginationContainer.appendChild(pageInfo);

        const nextButton = document.createElement('button');
        nextButton.innerHTML = '&raquo;';
        nextButton.disabled = state.currentPage === state.totalPages;
        nextButton.addEventListener('click', () => {
            state.currentPage++;
            fetchPosts();
        });
        paginationContainer.appendChild(nextButton);
    };

    // Update the "Showing X-Y of Z" text
    const updatePostCount = () => {
        const startItem = (state.currentPage - 1) * state.perPage + 1;
        const endItem = Math.min(startItem + state.perPage - 1, state.totalItems);
        postCountElement.textContent = `Showing ${startItem}-${endItem} of ${state.totalItems}`;
    };


    // --- Event Listeners ---
    showPerPageSelect.addEventListener('change', (e) => {
        state.perPage = parseInt(e.target.value, 10);
        state.currentPage = 1; // Reset to first page
        saveState();
        fetchPosts();
    });

    sortBySelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        state.currentPage = 1; // Reset to first page
        saveState();
        fetchPosts();
    });

    // --- Initial Load ---
    loadState();
    fetchPosts();
}); 