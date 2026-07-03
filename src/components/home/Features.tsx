export default function Features() {
  const items = [
    {
      title: "Global Shipping",
      description: "Free delivery on all premium orders.",
      icon: (
        <svg
          className="h-6 w-6 text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:scale-110"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124l-.84-13.44c-.04-.637-.6-1.136-1.242-1.136H7.5m10.5 15.75v-2.25m0-1.35h1.308c.514 0 .947-.36 1.01-.867l.186-1.488a2.25 2.25 0 00-2.23-2.528H15.75m0-4.867L19.5 9.75M7.5 4.875C7.5 4.116 8.116 3.5 8.875 3.5h7.25c.759 0 1.375.616 1.375 1.375v3.375H7.5V4.875z"
          />
        </svg>
      ),
    },
    {
      title: "Authenticity Guaranteed",
      description: "Every product verified by experts.",
      icon: (
        <svg
          className="h-6 w-6 text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:scale-110"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
          />
        </svg>
      ),
    },
    {
      title: "Secure Payment",
      description: "Encrypted transactions via Stripe.",
      icon: (
        <svg
          className="h-6 w-6 text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:scale-110"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      ),
    },
    {
      title: "24/7 Support",
      description: "Dedicated concierge service.",
      icon: (
        <svg
          className="h-6 w-6 text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:scale-110"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="border-y border-zinc-100 bg-zinc-50/50 py-8 dark:border-zinc-900 dark:bg-black/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
          {items.map((item, index) => (
            <div
              key={index}
              className="group flex flex-col items-center text-center p-4 rounded-xl hover:bg-white dark:hover:bg-zinc-900/50 transition-all duration-300 shadow-sm shadow-transparent hover:shadow-zinc-100 dark:hover:shadow-transparent"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/30 mb-4">
                {item.icon}
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
