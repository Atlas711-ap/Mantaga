"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search, Filter, Calendar, User, Tag, MessageSquare } from "lucide-react";

const brands = ["All", "Mudhish", "All"];
const platforms = ["All", "Talabat", "Noon", "Careem", "Amazon"];
const topics = ["All", "strategy", "platform", "compliance", "analysis", "operations", "expansion"];

export default function MemoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState("All");

  const memoryEntries = useQuery(api.seed.getMemoryEntries);

  const filteredEntries = memoryEntries?.filter((entry) => {
    const matchesSearch =
      searchQuery === "" ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.platform.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBrand = selectedBrand === "All" || entry.brand === selectedBrand;
    const matchesPlatform = selectedPlatform === "All" || entry.platform === selectedPlatform;
    const matchesTopic = selectedTopic === "All" || entry.topic === selectedTopic;

    return matchesSearch && matchesBrand && matchesPlatform && matchesTopic;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Memory Screen</h1>
        <p className="text-slate-400 mt-1">Mantaga operational memory and decisions log</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search memory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-500" />
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none"
            >
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand === "All" ? "All Brands" : brand}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none"
            >
              {platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform === "All" ? "All Platforms" : platform}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none"
            >
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic === "All" ? "All Topics" : topic.charAt(0).toUpperCase() + topic.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Memory Entries */}
      <div className="space-y-4">
        {filteredEntries?.map((entry) => (
          <div
            key={entry._id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                  {entry.brand}
                </span>
                <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                  {entry.platform}
                </span>
                <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded capitalize">
                  {entry.topic}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{entry.agent}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{entry.createdAt}</span>
                </div>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed">{entry.content}</p>
          </div>
        ))}

        {filteredEntries?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No memory entries found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
