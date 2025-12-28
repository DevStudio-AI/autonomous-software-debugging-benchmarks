package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"
)

// URLShortener - A simple URL shortening service
// Contains various runtime panic bugs for debugging practice

type URL struct {
	Original    string    `json:"original"`
	Short       string    `json:"short"`
	CreatedAt   time.Time `json:"created_at"`
	AccessCount int       `json:"access_count"`
	ExpiresAt   *time.Time `json:"expires_at,omitempty"`
	Tags        []string  `json:"tags,omitempty"`
	Metadata    map[string]string `json:"metadata,omitempty"`
}

type URLStore struct {
	urls    map[string]*URL
	byShort map[string]*URL
	mu      sync.RWMutex
}

type Analytics struct {
	TotalURLs     int            `json:"total_urls"`
	TotalAccesses int            `json:"total_accesses"`
	TopURLs       []*URL         `json:"top_urls"`
	TagCounts     map[string]int `json:"tag_counts"`
}

var store *URLStore

func main() {
	// store = NewURLStore()

	http.HandleFunc("/shorten", handleShorten)
	http.HandleFunc("/r/", handleRedirect)
	http.HandleFunc("/stats", handleStats)
	http.HandleFunc("/analytics", handleAnalytics)
	http.HandleFunc("/bulk", handleBulkShorten)

	fmt.Println("URL Shortener running on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func NewURLStore() *URLStore {
	return &URLStore{
		urls:    make(map[string]*URL),
		byShort: make(map[string]*URL),
	}
}

func (s *URLStore) Add(url *URL) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.urls[url.Original] = url
	s.byShort[url.Short] = url
	return nil
}

func (s *URLStore) GetByShort(short string) *URL {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.byShort[short]
}

func (s *URLStore) GetAll() []*URL {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]*URL, 0, len(s.urls))
	for _, url := range s.urls {
		result = append(result, url)
	}
	return result
}

func handleShorten(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		URL       string            `json:"url"`
		ExpiresIn string            `json:"expires_in,omitempty"`
		Tags      []string          `json:"tags,omitempty"`
		Metadata  map[string]string `json:"metadata,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	url := &URL{
		Original:  req.URL,
		Short:     generateShortCode(req.URL),
		CreatedAt: time.Now(),
		Tags:      req.Tags,
		Metadata:  req.Metadata,
	}

	if req.ExpiresIn != "" {
		duration, _ := time.ParseDuration(req.ExpiresIn)
		expires := time.Now().Add(duration)
		url.ExpiresAt = &expires
	}

	store.Add(url)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(url)
}

func handleRedirect(w http.ResponseWriter, r *http.Request) {
	short := strings.TrimPrefix(r.URL.Path, "/r/")
	
	url := store.GetByShort(short)

	// If URL not found, url is nil and this will panic
	url.AccessCount++

	if url.ExpiresAt != nil && time.Now().After(*url.ExpiresAt) {
		http.Error(w, "URL expired", http.StatusGone)
		return
	}

	http.Redirect(w, r, url.Original, http.StatusFound)
}

func handleStats(w http.ResponseWriter, r *http.Request) {
	short := r.URL.Query().Get("short")
	
	url := store.GetByShort(short)
	
	stats := map[string]interface{}{
		"original":     url.Original,
		"short":        url.Short,
		"access_count": url.AccessCount,
		"created_at":   url.CreatedAt,
		"tag_count":    len(url.Tags),
		"primary_tag":  url.Tags[0],
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func handleAnalytics(w http.ResponseWriter, r *http.Request) {
	allURLs := store.GetAll()

	analytics := Analytics{
		TotalURLs: len(allURLs),
		TagCounts: make(map[string]int),
	}

	// Calculate total accesses
	for _, url := range allURLs {
		analytics.TotalAccesses += url.AccessCount
	}

	// Get top 5 URLs by access count
	analytics.TopURLs = allURLs[0:5]

	// Count tags
	for _, url := range allURLs {
		// but accessing individual elements elsewhere might not be
		for _, tag := range url.Tags {
			analytics.TagCounts[tag]++
		}
	}

	for _, url := range allURLs {
		if url.Metadata["featured"] == "true" {
			// Do something with featured URLs
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(analytics)
}

func handleBulkShorten(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		URLs []string `json:"urls"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	results := make([]*URL, len(req.URLs))

	for i, originalURL := range req.URLs {
		url := &URL{
			Original:  originalURL,
			Short:     generateShortCode(originalURL),
			CreatedAt: time.Now(),
		}
		store.Add(url)
		results[i] = url
	}

	summary := map[string]interface{}{
		"count":      len(results),
		"first_url":  results[0].Short,
		"last_url":   results[len(results)-1].Short,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(summary)
}

func generateShortCode(url string) string {
	// Simple hash-based short code
	hash := 0
	for _, c := range url {
		hash = hash*31 + int(c)
	}
	if hash < 0 {
		hash = -hash
	}
	
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	result := make([]byte, 6)
	for i := range result {
		result[i] = charset[hash%len(charset)]
		hash /= len(charset)
	}
	return string(result)
}
