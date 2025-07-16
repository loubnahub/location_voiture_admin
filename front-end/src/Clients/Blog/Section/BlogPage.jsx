import React from 'react';
import { Search, ChevronRight } from 'lucide-react'; 
import Header from '../../Header/Nav'; // Ensure this path is correct

const sampleArchives = [
  { month: 'December', year: 2025, link: '#' },
  { month: 'November', year: 2025, link: '#' },
  { month: 'October', year: 2025, link: '#' },
];

const sampleCategories = [
  { name: 'Car Rental', link: '#' },
  { name: 'Vehicles', link: '#' },
  { name: 'Rent A Car', link: '#' },
  { name: 'Rental Service', link: '#' },
];

const sampleTags = [
  { name: 'Car', link: '#' },
  { name: 'Rental', link: '#' },
  { name: 'Service', link: '#' },
]; 
const BlogPostCard = ({ post }) => {
  return (
    <article className="tw-bg-[#2a2a2a] tw-rounded-xl tw-shadow-xl tw-overflow-hidden tw-flex tw-flex-col -tw-mt-80 md:tw-mt-0">
      {post.imageUrl && (
        <div className="tw-relative">
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="tw-w-full tw-h-56 sm:tw-h-64 md:tw-h-72 lg:tw-h-80 tw-object-cover" 
          />
        </div>
      )}
      <div className="tw-p-6 sm:tw-p-8 tw-flex-grow tw-flex tw-flex-col">
        <div className="tw-mb-3">
          <a 
            href={post.categoryLink || '#'} 
            className="tw-text-[#FFA600] hover:tw-text-[#e09100] tw-text-xs sm:tw-text-sm tw-font-semibold tw-uppercase tw-tracking-wider tw-transition-colors tw-no-underline" // Added tw-no-underline
          >
            {post.category}
          </a>
          <span className="tw-text-gray-500 tw-text-xs sm:tw-text-sm tw-ml-2 sm:tw-ml-3">
            {post.date}
          </span>
        </div>
        <h2 className="tw-text-xl sm:tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-white tw-mb-4">
          <a href={post.link || '#'} className="tw-text-white hover:tw-text-[#1572D3] tw-transition-colors tw-no-underline">{post.title}</a> {/* Added tw-no-underline */}
        </h2>
        <p className="tw-text-gray-400 tw-text-sm sm:tw-text-base tw-leading-relaxed tw-mb-6 tw-flex-grow">
          {post.excerpt}
        </p>
        <div className="tw-mt-auto">
          <a
            href={post.link || '#'}
            className="tw-inline-block tw-bg-[#FFA600] hover:tw-bg-[#e09100] tw-text-black tw-font-semibold tw-px-6 sm:tw-px-8 tw-py-3 tw-rounded-lg tw-text-sm sm:tw-text-base tw-transition-colors tw-shadow-md hover:tw-shadow-lg tw-no-underline" // Added tw-no-underline
          >
            Read More
          </a>
        </div>
      </div>
    </article>
  );
};

const SearchWidget = () => {
  return (
    <div className="tw-bg-[#2a2a2a] tw-p-6 tw-rounded-xl tw-shadow-xl">
      <form onSubmit={(e) => e.preventDefault()} className="tw-relative">
        <input
          type="text"
          placeholder="Type here..."
          className="tw-w-full tw-py-3 tw-pl-4 tw-pr-12 tw-text-white tw-bg-[#1b1b1b] tw-border tw-border-gray-600 tw-rounded-lg focus:tw-ring-2 focus:tw-ring-[#FFA600] focus:tw-border-[#FFA600] focus:tw-outline-none placeholder-gray-500"
        />
        <button
          type="submit"
          className="tw-absolute tw-right-0 tw-top-0 tw-bottom-0 tw-px-4 tw-bg-[#FFA600] hover:tw-bg-[#e09100] tw-text-black tw-rounded-r-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-offset-[#1b1b1b] focus:tw-ring-[#FFA600] tw-transition-colors"
          aria-label="Search"
        >
          <Search size={20} />
        </button>
      </form>
    </div>
  );
};

const RecentPostsWidget = ({ posts }) => {
  return (
    <div className="tw-bg-[#2a2a2a] tw-p-6 tw-rounded-xl tw-shadow-xl">
      <h3 className="tw-text-xl tw-font-semibold tw-text-white tw-mb-5">Recent Posts</h3>
      <ul className="tw-space-y-4">
        {posts.map((post) => (
          <li key={post.id} className="tw-flex tw-items-start tw-space-x-3">
            <a href={post.link || '#'} className="tw-flex-shrink-0 tw-no-underline"> {/* Added tw-no-underline */}
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="tw-w-20 tw-h-14 tw-object-cover tw-rounded-md hover:tw-opacity-80 tw-transition-opacity"
              />
            </a>
            <div>
              <h4 className="tw-text-sm tw-font-medium tw-text-white tw-leading-tight">
                <a href={post.link || '#'} className="tw-text-white hover:tw-text-[#1572D3] hite tw-no-underline">{post.title}</a> {/* Added tw-no-underline */}
              </h4>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ArchivesWidget = ({ archives }) => {
  return (
    <div className="tw-bg-[#2a2a2a] tw-p-6 tw-rounded-xl tw-shadow-xl">
      <h3 className="tw-text-xl tw-font-semibold tw-text-white tw-mb-5">Archives</h3>
      <ul className="tw-space-y-2">
        {archives.map((archive) => (
          <li key={archive.month + archive.year}>
            <a 
              href={archive.link || '#'} 
              className="tw-text-gray-300 hover:tw-text-[#FFA600] tw-text-sm tw-transition-colors tw-no-underline" // Added tw-no-underline
            >
              {archive.month} {archive.year}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

const CategoriesWidget = ({ categories }) => {
  return (
    <div className="tw-bg-[#2a2a2a] tw-p-6 tw-rounded-xl tw-shadow-xl">
      <h3 className="tw-text-xl tw-font-semibold tw-text-white tw-mb-5">Categories</h3>
      <ul className="tw-space-y-2">
        {categories.map((category) => (
          <li key={category.name}>
            <a 
              href={category.link || '#'} 
              className="tw-flex tw-items-center tw-justify-between tw-text-gray-300 hover:tw-text-[#FFA600] tw-text-sm tw-transition-colors group tw-no-underline" // Added tw-no-underline
            >
              <span>{category.name}</span>
              <ChevronRight size={16} className="tw-text-gray-500 group-hover:tw-text-[#FFA600] tw-transition-colors" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

const TagsWidget = ({ tags }) => {
  return (
    <div className="tw-bg-[#2a2a2a] tw-p-6 tw-rounded-xl tw-shadow-xl">
      <h3 className="tw-text-xl tw-font-semibold tw-text-white tw-mb-5">Tags</h3>
      <div className="tw-flex tw-flex-wrap tw-gap-2">
        {tags.map((tag) => (
          <a
            key={tag.name}
            href={tag.link || '#'}
            className="tw-bg-[#1b1b1b] hover:tw-bg-gray-700 tw-text-gray-300 hover:tw-text-white tw-px-3 tw-py-1.5 tw-rounded-md tw-text-xs sm:tw-text-sm tw-font-medium tw-transition-colors tw-no-underline" // Added tw-no-underline
          >
            {tag.name}
          </a>
        ))}
      </div>
    </div>
  );
};
// --- END OF Sidebar Widget Components ---


// --- Sidebar Component ---
const Sidebar = () => {
  const sampleRecentPosts = [
    { id: 1, title: 'How to Rent a Car at the Airport Terminal?', imageUrl: '/images/Cars/car1.jpg', link: '#' }, // Ensure these paths are valid from public folder
    { id: 2, title: 'Penalties for violating the rules in rental cars', imageUrl: '/images/Cars/car2.jpg', link: '#' },
    { id: 3, title: 'How to check a car before renting?', imageUrl: '/images/Cars/1.jpg', link: '#' },
  ];
 
  return (
    <aside className="tw-space-y-8">
      <SearchWidget />
      <RecentPostsWidget posts={sampleRecentPosts} />
      <ArchivesWidget archives={sampleArchives} />
      <CategoriesWidget categories={sampleCategories} />
      <TagsWidget tags={sampleTags} />
    </aside>
  );
};
// --- END OF Sidebar Component ---


// --- BlogPage Component (Main Page) ---
const BlogPage = () => {
  const blogPostsData = [
    {
      id: 'post1',
      imageUrl: '/images/Cars/greenCar.jpg', // Ensure this path is valid from public folder
      category: 'Rent A Car',
      categoryLink: '#',
      date: '27 Apr, 2025',
      title: 'Documents required for car rental',
      excerpt: 'Lorem ipsum potenti fringilla pretium ipsum non blandit vivamus eget nisi non mi iaculis iaculis imperie quiseros sevin elentes𝐪ue habitant morbi tristique senectus et netus et malesuada the fames ac turpis enesta mauris suscipit mis nec est farmen.',
      link: '#',
    },
    {
      id: 'post2',
      imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80', 
      category: 'Cars',
      categoryLink: '#',
      date: '25 Apr, 2025',
      title: 'Rental cost of sport and other cars',
      excerpt: 'Lorem ipsum potenti fringilla pretium ipsum non blandit vivamus eget nisi non mi iaculis iaculis imperie quiseros sevin elentes𝐪ue habitant morbi tristique senectus et netus et malesuada the fames ac turpis enesta mauris suscipit mis nec est farmen.',
      link: '#',
    },
  ];

  const headerHeight = 70; 

  return (
    <div className="tw-bg-[#1b1b1b] tw-min-h-screen"> {/* Main background color */}
      <Header />
      <main 
        className="tw-container tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8"
        style={{ paddingTop: `${headerHeight + 40}px`, paddingBottom: '60px' }}
      >
        <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-12 tw-gap-8 lg:tw-gap-12">
          {/* Main Blog Posts Area */}
          <div className="lg:tw-col-span-8">
            <div className="tw-space-y-10">
              {blogPostsData.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:tw-col-span-4">
            <Sidebar />
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlogPage;