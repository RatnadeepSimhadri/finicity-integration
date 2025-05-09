'use client';

import { useEffect, useState } from 'react';
import { finicityClient, FinicityInstitution } from '@/lib/finicity';

export default function BankSearchPage() {
  const [institutions, setInstitutions] = useState<FinicityInstitution[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchInstitutions = async (page: number, search: string = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/finicity/institutions?search=${encodeURIComponent(search)}&page=${page}`);
      const data = await response.json();
      setInstitutions(prev => page === 1 ? data.institutions : [...prev, ...data.institutions]);
      setHasMore(data.more);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch institutions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchInstitutions(1, searchTerm);
  }, [searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    // Reset institutions and page when search term changes
    setInstitutions([]);
    setCurrentPage(1); 
  };
  
  // Debounce search input if needed, for now direct search on change
  // useEffect(() => {
  //   const delayDebounceFn = setTimeout(() => {
  //     fetchInstitutions(1, searchTerm);
  //   }, 500) // 500ms delay
  //   return () => clearTimeout(delayDebounceFn)
  // }, [searchTerm])


  const loadMore = () => {
    if (hasMore && !loading) {
      fetchInstitutions(currentPage + 1, searchTerm);
    }
  };

  const handleInstitutionClick = (institutionId: number) => {
    console.log('Institution clicked:', institutionId);
    // You can add further logic here, e.g., navigating to another page or opening a modal
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12 text-center">
            
            <br/>
            <h1 className="text-3xl font-bold mb-4">Search Financial Institutions</h1>

        </header>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search for banks..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-4 text-lg border border-gray-300 rounded-md"
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {institutions.length === 0 && !loading && !error && (
        <p>No institutions found for "{searchTerm}". Try a different search.</p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {institutions.map((inst) => (
          <div 
            key={inst.id} 
            className="border p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer dark:border-gray-700 dark:bg-gray-800"
            onClick={() => handleInstitutionClick(inst.id)}
          >
            {inst.logo && (
              <img 
                src={inst.logo} 
                alt={`${inst.name} logo`} 
                className="h-12 w-auto mb-2 object-contain" 
                onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if logo fails to load
              />
            )}
            <h2 className="text-lg font-semibold dark:text-white">{inst.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">ID: {inst.id}</p>
            {inst.url && (
              <a 
                href={inst.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 hover:underline text-sm"
              >
                Visit Website
              </a>
            )}
            {inst.oauthEnabled && (
                <span className="ml-2 inline-block bg-green-200 text-green-800 text-xs px-2 rounded-full uppercase font-semibold tracking-wide dark:bg-green-700 dark:text-green-100">
                    OAuth
                </span>
            )}
          </div>
        ))}
      </div>

      {loading && <p className="text-center mt-4">Loading...</p>}

      {!loading && hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={loadMore}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Load More
          </button>
        </div>
      )}
       {!loading && !hasMore && institutions.length > 0 && (
        <p className="text-center mt-4 text-gray-500">End of results.</p>
      )}
    </div>
    </div>
  );
}
