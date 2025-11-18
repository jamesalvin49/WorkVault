interface TagCloudProps {
  allTags: string[];
  setSearchTerm: (term: string) => void;
}

export function TagCloud({ allTags, setSearchTerm }: TagCloudProps) {
  if (!allTags || allTags.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-card rounded-lg border">
      <h3 className="text-lg font-semibold mb-3">Popular Tags</h3>
      <div className="flex flex-wrap gap-2">
        {allTags.slice(0, 20).map((tag, index) => (
          <button
            key={tag}
            onClick={() => setSearchTerm(tag)}
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors p-2 rounded-md border"
          >
            <span className="text-sm">{tag}</span>
          </button>
        ))}
        {allTags.length > 20 && (
          <button
            onClick={() => {
              setSearchTerm('');
              setTimeout(() => {
                setSearchTerm(allTags.slice(20).join(','));
              }, 100);
            }}
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors p-2 rounded-md border"
          >
            <span className="text-sm">+{allTags.length - 20} more</span>
          </button>
        )}
      </div>
    </div>
  );
}