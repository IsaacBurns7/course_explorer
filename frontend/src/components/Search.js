import React, { useState } from "react";

const suggestions = [
  "CSCE 120",
  "CSCE 121",
  "CSCE 222",
  "CSCE 312",
  "CSCE 315",
  "CSCE 411",
  "CSCE 481",
  "MATH 151",
  "PHYS 206",
];

export default function AutoCompleteSearch() {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length === 0) {
      setFiltered([]);
    } else {
      const matches = suggestions.filter((s) =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setFiltered(matches);
    }
  };

  const handleSelect = (item) => {
    setQuery(item);
    setFiltered([]);
  };

  return (
    <div className="relative w-[400px] mx-auto">
      <input
        className=" pl-10 py-5 max-w-md bg-black text-white rounded-full hover:bg-gray-800 transition duration-300"
    type="text"
    placeholder="Input Professor or Class Name (ex: CSCE 120)"
    style = {{width: "800px", "margin-left": "80px"}}
        value={query}
        onChange={handleChange}
      />
      {filtered.length > 0 && (
        <ul className="absolute z-10 w-full bg-white text-black rounded-md mt-2 shadow-lg max-h-60 overflow-y-auto">
          {filtered.map((item, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-500 cursor-pointer bg-blackX"
              onClick={() => handleSelect(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
      <button className="ml-4 px-6 py-2 border border-purple-500 text-white rounded-full hover:bg-purple-600 transition duration-300">
        Search
      </button>
    </div>
  );
}