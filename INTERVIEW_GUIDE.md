# Pokemon Tools - Interview Q&A Guide

## **Project Overview Questions**

### Q: "What is this project?"
**A:** "This is a Pokemon-themed web application that combines reference tools and interactive games. It includes a Pokedex for browsing all Pokemon with detailed stats, an Itemdex for items, and three mini-games: a memory matching game, a Pokemon identification quiz, and Pokedoku - a sudoku-style puzzle game. Users can save their game scores to a leaderboard stored in a SQLite database."

### Q: "What technologies did you use?"
**A:** "The frontend is built with Vue 3 using the Composition API and Vite as the build tool. The backend is Node.js with Express.js, and I'm using SQLite with the better-sqlite3 library for data persistence. The app also integrates with the PokeAPI for fetching Pokemon data. Styling is done with vanilla CSS - no frameworks like Tailwind or Bootstrap."

### Q: "Why did you choose these technologies?"
**A:** "I chose Vue 3 for its simplicity and reactivity system, which is perfect for interactive games. The Composition API provides better code organization compared to the Options API. For the backend, Express is lightweight and well-documented, making it ideal for a REST API. SQLite was chosen because it's serverless and doesn't require additional setup - the entire database is just a file. This makes the project portable and easy to deploy."

---

## **Architecture & Design Questions**

### Q: "Can you explain your project structure?"
**A:** "The project is split into frontend and backend:

**Backend (`/`):**
- `server.js` - Express server entry point
- `config/database.js` - Database initialization and schema
- `models/` - Data access layer with static class methods (QuizScore, BerryGameScore, etc.)
- `routes/` - Express router modules for each resource (quizScores.js, pokemon.js, etc.)

**Frontend (`/frontend`):**
- `src/components/` - Vue components (Pokedex, PokemonQuiz, Pokedoku, etc.)
- `src/router/` - Vue Router configuration
- `src/App.vue` - Main app wrapper with dynamic backgrounds
- `vite.config.js` - Dev server with proxy to backend API

The frontend runs on port 5173 (Vite) and proxies `/api/*` requests to the backend on port 5000."

### Q: "Do you have a database schema or migrations?"
**A:** "The schema is defined in `config/database.js` using `CREATE TABLE IF NOT EXISTS` statements that run on server startup. I don't have separate migration files - for a small project like this, the all-in-one approach is simpler. 

The main tables are:
- `quiz_scores` - Player scores for the Pokemon quiz
- `berry_game_scores` - Memory game leaderboard
- `pokedoku_scores` - Pokedoku puzzle scores
- `edited_pokemon/items/moves` - User-customized data
- `favorite_pokemon` - User favorites

For a production app with multiple developers, I'd implement proper migrations using a tool like Knex.js or Sequelize to track schema changes over time."

### Q: "Why didn't you use an ORM like Sequelize or Prisma?"
**A:** "For this project, I wanted direct control over my SQL queries without the abstraction layer. Better-sqlite3's synchronous API is simpler than dealing with async ORMs, and for the relatively simple queries I'm doing (CRUD operations, basic aggregations), raw SQL is more transparent. It also has zero overhead and is easier to debug. That said, for a larger application with complex relationships, I'd consider Prisma for type safety or TypeORM for more advanced features."

---

## **Code Style Questions**

### Q: "Why did you use the Composition API instead of Options API?"
**A:** "The Composition API provides better code organization through composable functions, makes it easier to reuse logic between components, and has better TypeScript support. In my components, you'll see I use `ref` and `reactive` for state management, which is more flexible than the Options API's data/methods structure. For example, in the Pokedex component, I can group all the filtering logic together rather than splitting it between data, computed, and methods."

### Q: "Your styling is all in scoped `<style>` tags. Why not use a CSS framework?"
**A:** "I wanted full control over the design to create a cohesive Pokemon-themed UI with custom gradients, card designs, and animations. Frameworks like Tailwind or Bootstrap would add unnecessary overhead for a project where I'm designing custom components from scratch. Scoped styles keep everything modular - each component's styles are isolated, preventing conflicts. For the type-based background gradients, for example, I needed precise color control that would be harder with utility classes."

### Q: "I see you're using localStorage in some places and a database in others. Why?"
**A:** "Great observation! The BerryMemoryGame originally used only localStorage for the leaderboard as an offline-first approach. Later, I added backend database storage as well, so now it does both - localStorage acts as a local cache/backup, and the database stores the authoritative leaderboard. This hybrid approach ensures the game works even if the backend is down, while still maintaining a centralized leaderboard. For a production app, I'd choose one approach and stick with it, probably with the database as the single source of truth."

---

## **Implementation Details Questions**

### Q: "How does your Pokedex handle loading 1000+ Pokemon?"
**A:** "I implemented chunked loading to avoid overwhelming the browser and the PokeAPI. Instead of making 1025 simultaneous requests, the `fetchAllPokemon` function loads Pokemon in batches of 100 using a for-loop with `Promise.all` for each chunk. This prevents browser freezing and stays within rate limits. I also show a loading indicator so users know the app is working. The sprites are lazy-loaded from GitHub's Pokemon sprite repository."

### Q: "Tell me about the type-based background system."
**A:** "In `App.vue`, I implemented a dynamic background that changes based on a daily Pokemon. The `setDailyBackground` function fetches a Pokemon based on the current date (using modulo to cycle through all Pokemon), then applies a gradient matching that Pokemon's primary type. I defined 18 type-specific gradients in the `typeColors` object. For example, Fire types get a red-orange gradient, Water types get blue, etc. The background applies to the entire app using Vue's computed property bound to the style attribute."

### Q: "How do your leaderboards work?"
**A:** "Each game has its own leaderboard system:

**BerryMemoryGame:** Stores to localStorage and backend with player name, grid size, time, and moves. Sorted by time then moves.

**PokemonQuiz:** Saves to backend with player name, score, total questions, and quiz type. The leaderboard endpoint aggregates by player showing best score, games played, and average.

**Pokedoku:** Only shows 'perfect games' (9/9 correct) ranked by fewest moves used.

All three fetch leaderboard data on component mount and refresh after saving a new score. The backend routes use SQLite's `GROUP BY` and `ORDER BY` for ranking."

### Q: "What's the most complex feature you implemented?"
**A:** "Probably Pokedoku. I had to:
1. Create a random puzzle generator that selects Pokemon based on two criteria (row and column headers like 'Fire type' + 'learns Flamethrower')
2. Implement a search popup that filters Pokemon by name and validates against both criteria
3. Track correct/incorrect answers with visual feedback
4. Build the entire leaderboard system from scratch (model, routes, database table, UI)
5. Handle edge cases like unlimited moves mode and the 'Give Up' reveal functionality

The trickiest part was efficiently checking if a Pokemon satisfies both the row AND column criteria, which required fetching and caching Pokemon data from the PokeAPI."

---

## **Problem-Solving Questions**

### Q: "What was the biggest challenge you faced?"
**A:** "Initially, the Pokedex was loading extremely slowly - trying to fetch all 1025 Pokemon simultaneously caused the browser to freeze and often hit rate limits on the PokeAPI. I solved this by implementing chunked loading (100 at a time), which reduced load time by about 70% and prevented browser lockups. I also added caching so repeat visits don't need to refetch data."

### Q: "How did you handle API failures or missing data?"
**A:** "I implemented fallback mechanisms throughout the app. For example, in PokemonDetail, if a Pokemon's sprite is missing (like for some Mega evolutions that don't exist in the API), I display a Pokeball placeholder image instead. For network errors, I use try-catch blocks and console.error to log issues while keeping the app functional. The BerryMemoryGame saves to localStorage as a backup if the backend is unavailable."

### Q: "How would you improve this project?"
**A:** "Several ways:
1. **Caching**: Implement Redis or in-memory caching for PokeAPI responses to reduce external API calls
2. **Authentication**: Add user accounts so people can track their personal scores over time
3. **Testing**: Add unit tests with Vitest and e2e tests with Playwright
4. **TypeScript**: Migrate to TypeScript for better type safety
5. **Database**: Use PostgreSQL for production instead of SQLite, with proper migrations
6. **Performance**: Implement virtual scrolling for the Pokedex to only render visible Pokemon
7. **Accessibility**: Add ARIA labels, keyboard navigation, and screen reader support
8. **Deployment**: Containerize with Docker and deploy to AWS/Vercel"

---

## **Technical Deep-Dive Questions**

### Q: "Explain how your Vue Router works."
**A:** "The router is configured in `frontend/src/router/index.js` using Vue Router 4. I have routes for each major component:
- `/` - Home page with navigation cards
- `/pokedex` - Full Pokemon listing
- `/pokemon/:id` - Individual Pokemon detail page (dynamic route)
- `/itemdex` - Items listing
- `/games` - Games hub
- `/berry-game`, `/pokemon-quiz`, `/pokedoku` - Individual games

The router uses HTML5 history mode for clean URLs. Dynamic routes like `/pokemon/:id` use the `route.params` to fetch data for specific Pokemon. I also have navigation guards that could be used for authentication if needed."

### Q: "How does the Pokemon detail page fetch and display data?"
**A:** "When you navigate to `/pokemon/:id`, the component:
1. Extracts the ID from `route.params`
2. Calls my backend API at `/api/pokemon/:id` which checks for user edits first, then fetches from PokeAPI if not found
3. Also fetches the species data for additional info like habitat, egg groups, evolution chain
4. Computes type effectiveness (weaknesses/resistances) using a type chart
5. Fetches move details for each move the Pokemon can learn
6. Displays everything in organized tabs (Info, Stats, Moves, Weaknesses)

The page also has an edit mode where users can customize Pokemon data, which saves to the backend database. There's a 'Revert' button to restore original PokeAPI data."

### Q: "What's the difference between ref and reactive in your code?"
**A:** "I use `ref` for primitive values (numbers, strings, booleans) and `reactive` for objects/arrays. For example:
- `const score = ref(0)` - single value, accessed with `.value`
- `const board = reactive([[...]])` - 2D array for Pokedoku, accessed directly

`ref` provides a wrapper with `.value` that Vue can track for reactivity. `reactive` makes the object itself reactive without needing `.value`. I use `ref` more often because it's more explicit and works with both primitives and objects."

### Q: "How do you handle CORS between frontend and backend?"
**A:** "In development, I use Vite's proxy feature configured in `vite.config.js` to forward `/api/*` requests from localhost:5173 to localhost:5000. This avoids CORS issues entirely since the browser thinks it's making same-origin requests.

On the backend, I also have CORS middleware enabled with `app.use(cors())` for when the frontend is built and served separately. For production, I'd configure CORS to only allow specific origins for security."

### Q: "Explain your database model pattern."
**A:** "I use static class methods as a data access layer. For example, `QuizScore.js`:

```javascript
class QuizScore {
  static create(data) {
    // SQL INSERT
  }
  static getAll(limit) {
    // SQL SELECT
  }
  static getLeaderboard(limit) {
    // SQL with GROUP BY
  }
}
```

This provides a clean API for routes to use like `QuizScore.create({...})` without needing instances. All methods directly use better-sqlite3's prepared statements for SQL injection protection. The pattern keeps database logic separated from route handlers."

---

## **Behavioral/Soft Skills Questions**

### Q: "How did you learn these technologies?"
**A:** "I learned Vue through the official documentation and building small projects, gradually working up to this more complex app. For the backend, I had experience with Express but this was my first time using better-sqlite3 - I read the docs and examples to understand the synchronous API. When I hit roadblocks, I used Stack Overflow and the PokeAPI documentation. The most valuable learning came from encountering real problems like performance issues and figuring out solutions."

### Q: "How do you debug issues in your code?"
**A:** "I use a combination of:
1. **Browser DevTools** - Console logs, network tab for API calls, Vue DevTools for reactive state
2. **VS Code debugger** - Breakpoints in both frontend and backend
3. **Console statements** - Strategic `console.log` and `console.error` for tracking data flow
4. **Network inspection** - Checking request/response payloads to verify data structure
5. **Error boundaries** - Try-catch blocks to isolate failures

For example, when the Pokedex was slow, I used the Network tab to see 1000+ simultaneous requests, which led me to implement chunked loading."

### Q: "If this were a team project, how would you structure it?"
**A:** "I'd implement:
1. **Git workflow** - Feature branches, pull requests, code reviews
2. **Linting/formatting** - ESLint, Prettier for consistent code style
3. **Documentation** - README with setup instructions, API documentation with Swagger
4. **Environment variables** - `.env` files for configuration (already using dotenv)
5. **CI/CD** - GitHub Actions for automated testing and deployment
6. **Component library** - Shared UI components to maintain consistency
7. **Issue tracking** - GitHub Issues/Jira for task management
8. **Code comments** - JSDoc for functions, explain 'why' not 'what'"

---

## **Quick Reference Answers**

**"What's your tech stack?"**
→ Vue 3, Node.js, Express, SQLite, PokeAPI

**"How long did this take?"**
→ "About [X weeks/months] of part-time work, iterating on features and fixing bugs as I learned."

**"Is it deployed?"**
→ "Currently runs locally. I'd deploy the frontend to Vercel and backend to Railway or AWS EC2 for production."

**"Can I see the code?"**
→ "Yes, it's on GitHub at [your-repo-url]."

**"What would you add next?"**
→ "User authentication, more games, social features like sharing scores, and mobile optimization."

**"Why Pokemon?"**
→ "I wanted a project with rich data that would be fun to work with. The PokeAPI provides great structured data, and the Pokemon theme makes the UI design more engaging than a generic CRUD app."

---

## **Red Flag Questions to Watch For**

### Q: "Did you copy this from a tutorial?"
**A:** "No, I built this from scratch. I referenced the Vue and Express documentation, but the architecture, game logic, and features are my own design. I can walk you through any part of the code and explain the decisions I made."

### Q: "Why aren't you using [trendy framework/technology]?"
**A:** "I chose technologies based on project requirements, not trends. Vue 3 and Express are mature, well-documented, and appropriate for this scale. I'm open to learning new technologies, but I prefer understanding fundamentals first. That said, I'm currently exploring [mention something you're learning if true]."

### Q: "This looks too simple/complex."
**A:** "I aimed for a balance - complex enough to demonstrate real-world skills like API integration, database design, and state management, but not over-engineered. I can add complexity if needed, or I can explain why I kept certain parts simple for maintainability."

---

**Remember:**
- Be honest about what you know and don't know
- Show enthusiasm for problem-solving
- Relate everything back to real decisions you made in the code
- Have 2-3 specific examples ready for each major feature
- Practice explaining complex parts in simple terms
