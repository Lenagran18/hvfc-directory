import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Search,
  X,
  MapPin,
  Mail,
  ArrowLeft,
  ExternalLink,
  DollarSign,
  Calendar,
  Building,
} from "lucide-react";
import { useOutsetaAuth } from "../hooks/useOutsetaAuth";

//Helper function 
function formatDateRange(start, end) {
  if (!start && !end) return "";

  const fmt = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const startFormatted = start ? fmt.format(new Date(start)) : "";
  const endFormatted = end ? fmt.format(new Date(end)) : "";

  if (startFormatted && endFormatted) {
    return `${startFormatted} - ${endFormatted}`;
  }

  // If only one date exists
  return startFormatted || endFormatted;
}

const JobBoard = () => {
  const { isAuthenticated, loading: authLoading, user } = useOutsetaAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Auth Status:", { isAuthenticated, authLoading, user });
  }, [isAuthenticated, authLoading, user]);

  useEffect(() => {
    if (authLoading) return;

    const fetchJobs = async () => {
      try {
        const response = await axios.get("/.netlify/functions/getJobs");
        const transformedData = response.data.records.map((record) => ({
          id: record.id,
          title: record.fields.Title || "",
          company: record.fields.CompanyName || "",
          location: record.fields.Location || "",
          description: record.fields.Description || "",
          rate: record.fields.Rate || "",
          startDate: record.fields.StartDate || "",
          endDate: record.fields.EndDate || "",
          Contact: record.fields.contact || "",
          contactEmail: record.fields.ContactEmail || "",
          contactPhone: record.fields.ContactPhone || "",
          approved: record.fields.Approved || false,
          approvedTime: record.fields.ApprovedTime || "",
          postedDate: record.fields.PostedDate || "",
        }));

        setJobs(transformedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching from Airtable:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchJobs();
  }, [authLoading, isAuthenticated]);

  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredJobs = useMemo(() => {
    if (!searchTerm.trim()) {
      return jobs;
    }

    const searchLower = searchTerm.toLowerCase().trim();

    return jobs.filter((job) => {
      // Combine all searchable fields into one string
      const searchableText = [
        job.title,
        job.company,
        job.location,
        job.description,
        job.rate,
        job.HiringContact,
      ]
        .filter(Boolean) // Remove null/undefined values
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchLower);
    });
  }, [jobs, searchTerm]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleApply = (job) => {
    const emailSubject = encodeURIComponent(`Application for ${job.title}`);
    const emailBody = encodeURIComponent(
      `Hello,\n\nI am interested in applying for the ${job.title} position at ${
        job.company
      }.\n\nMy Profile Information:\nName: ${user?.FullName || "N/A"}\nEmail: ${
        user?.Email || "N/A"
      }\n\nBest regards,\n${user?.FullName || ""}`
    );

    window.location.href = `mailto:${job.hiringEmail}?subject=${emailSubject}&body=${emailBody}`;
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (selectedJob) {
    return (
      <div>
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setSelectedJob(null)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Job Board
            </button>
          </div>
        </header>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                          {selectedJob.title}
                        </h1>
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <span className="text-lg font-medium">
                            {selectedJob.company}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-600">
                          {selectedJob.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {selectedJob.location}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-gray-600 mt-2">
                          {selectedJob.rate && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              {selectedJob.rate}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6">
                    <h2 className="text-2xl font-semibold mb-4">
                      Job Description
                    </h2>
                    <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {selectedJob.description || "No description available."}
                    </div>
                  </div>
                </div>

                {selectedJob.categories &&
                  selectedJob.categories.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="p-6">
                        <h2 className="text-2xl font-semibold mb-4">
                          Categories
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.categories.map((category, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-slate-100 text-slate-900"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Apply for this Position
                    </h3>

                    <div className="space-y-4">
                      {selectedJob.hiringEmail && (
                        <button
                          onClick={() => handleApply(selectedJob)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          <Mail className="h-4 w-4" />
                          Apply for Job
                        </button>
                      )}
                      {selectedJob.externalUrl && (
                        <a
                          href={selectedJob.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Apply on Company Site
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {selectedJob.postedDate && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-3">
                        Job Details
                      </h3>
                      <div className="text-sm text-gray-600">
                        <p>
                          Posted:{" "}
                          {new Date(
                            selectedJob.postedDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto p-6">
        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by title, company, location, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Showing {filteredJobs.length}{" "}
          {filteredJobs.length === 1 ? "job" : "jobs"}
        </div>

        {/* Job List */}
        <div className="space-y-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className="cursor-pointer bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="p-8">
                {/* Top Row */}
                <div className="flex items-start justify-between mb-6 gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Posted Date Badge */}
                      {job.postedDate && (
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-sm border text-gray-500">
                          {new Date(job.postedDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Job Title */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {job.title}
                    </h3>

                    {/* Company */}
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span>{job.company || "Company not listed"}</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{job.location || "Location not listed"}</span>
                    </div>

                    {/* Date Range */}
                    {(job.startDate || job.endDate) && (
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDateRange(
                          selectedJob.startDate,
                          selectedJob.endDate
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right side rate */}
                  {job.rate && (
                    <div className="text-right shrink-0 text-gray-600">
                      <div className="text-gray-500 mb-1">Rate</div>
                      <div className="flex items-center justify-end gap-1 font-medium text-gray-600">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>{job.rate}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t my-4"></div>

                {/* Description */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </h4>
                  <p className="text-gray-600 leading-relaxed line-clamp-2">
                    {job.description || "No description provided."}
                  </p>
                </div>

                {job.categories && job.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {job.categories.slice(0, 3).map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {cat}
                      </span>
                    ))}
                    {job.categories.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{job.categories.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No jobs found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobBoard;
