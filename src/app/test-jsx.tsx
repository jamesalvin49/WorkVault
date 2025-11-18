'use client';

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold">Resource Manager</h1>
      <div className="p-4">
        <p>Testing JSX structure...</p>
        <div className="mt-4">
          <div>
            <p>Tag Cloud test:</p>
            <div>Tags exist: {allTags.length > 0 ? 'Yes' : 'No'}</div>
          </div>
          <div>
            <p>Tag Cloud component:</p>
            <div>
              {allTags.length > 0 ? (
                allTags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="inline-block bg-gray-100 p-2 rounded cursor-pointer">
                    {tag}
                  </span>
                ))
              ) : (
                <p>No tags available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}