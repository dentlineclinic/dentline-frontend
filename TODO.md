# TODO (Doctor admin page fetch de-dupe + race fix)

- [ ] Remove PAGE change effect that immediately fetches with debounceRef cleanup (the “duplicates API calls” issue).
- [ ] Remove initial-load mount effect that calls fetchData(0, "", true) (double fetch issue).
- [ ] Fix race-condition code by adding a `requestId` guard inside fetchData and removing the currently-unused increment.
- [ ] Correct isInitialLoad logic: only allow true once via a single initial load effect.
- [ ] Replace the SEARCH effect with the exact debounced version provided (depends only on [search]).
- [ ] Update `handleSearchChange` to setPage(0) before setSearch.
- [ ] Run TypeScript/Next build or lint to ensure no errors.

