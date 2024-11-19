"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import moment from "moment-timezone";
import { useTheme } from "next-themes";
import { Search, Sun, Moon, Film } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MovieTable } from "@/components/movie-table";
import { MovieDashboard } from "@/components/movie-dashboard";
import { toast } from "sonner";

const TMDB_API_KEY = "84bef04731b60d2f1bd0f851679b2ec5";
const TMDB_API_URL = "https://api.themoviedb.org/3";

export function MovieSearch() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState({});
  const [loading, setLoading] = useState(false);
  const { theme, setTheme } = useTheme();

  const fetchGenres = async () => {
    try {
      const response = await axios.get(
          `${TMDB_API_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=pt-BR`
      );
      const genresMap = {};

      response.data.genres.forEach((genre: any) => {
        // @ts-ignore
        genresMap[genre.id] = genre.name;
      });
      setGenres(genresMap);
    } catch (error) {
      console.error("Erro ao buscar gêneros:", error);
    }
  };

  const searchMovies = async () => {
    if (!query.trim()) {
      toast.error("Por favor, digite um termo para busca");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${TMDB_API_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          query
        )}&language=pt-BR`
      );
      setMovies(response.data.results);
    } catch (error) {
      toast.error("Erro ao buscar filmes");
      console.error("Erro ao buscar filmes:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGenres();
  }, []);
  return (
      <div className="space-y-8">
        <div className={"border-b-2"}>
          <div className={"container mx-auto pt-6 py-3 "}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Film className="h-8 w-8"/>
                <h1 className="text-3xl font-bold">Busca de Filmes</h1>
              </div>
              <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"/>
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
              </Button>
            </div>
          </div>
        </div>


        <div className={"sticky top-0 bg-card z-10"}>
          <div className={"container mx-auto py-6"}>
            <MovieDashboard/>

            <div className="flex gap-4 mt-5">
              <Input
                  placeholder="Buscar filmes..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && searchMovies()}
              />
              <Button onClick={searchMovies} disabled={loading}>
                <Search className="mr-2 h-4 w-4"/>
                Buscar
              </Button>
            </div>
          </div>
        </div>


        <AnimatePresence mode="wait">
          <motion.div
              key={movies.length}
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -20}}
              transition={{duration: 0.2}}
              className={"container mx-auto pb-10"}
          >
            {movies?.length > 0 && <div className={"mb-4"}><span>{movies.length} resultados</span></div>}
            <MovieTable movies={movies} genres={genres}/>
          </motion.div>
        </AnimatePresence>
      </div>
  );
}