
import { Link } from "react-router-dom";

const SearchResults = ({ results }: { results: any[] }) => {
  if (!results.length) return <div className="text-center text-gray-400">No results found.</div>;
  return (
    <div>
      {results.map((item) => (
        <div key={item.id} className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h4 className="font-bold">{item.title}</h4>
            <p className="text-xs text-gray-500">{item.type} in {item.location}</p>
          </div>
          <Link to={`/${item.type}/${item.id}`}>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded px-3 py-1">
              View Details
            </button>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
