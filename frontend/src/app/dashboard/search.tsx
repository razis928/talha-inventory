import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface SearchResult {
  id: number;
  title: string;
  url: string;
}

const SearchPage = () => {
  const router = useRouter();
  const { query } = router.query;
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (query) {
      const sanitizedQuery = decodeURIComponent(query as string).replace(
        /^http:\/\/localhost:3000\//,
        '',
      );
      fetch(`/api/search?query=${encodeURIComponent(sanitizedQuery)}`)
        .then((res) => res.json())
        .then((data) => setResults(data.results))
        // eslint-disable-next-line no-console
        .catch((error) => console.error(error));
    }
  }, [query]);

  return (
    <div>
      <h1>Search Results for "{query}"</h1>
      <ul>
        {results.map((result) => (
          <li key={result.id}>
            <a href={result.url}>{result.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchPage;
