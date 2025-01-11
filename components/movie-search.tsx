"use client";

import {useState, useEffect, useRef} from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useTheme } from "next-themes";
import { Search, Sun, Moon, Film, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MovieTable } from "@/components/movie-table";
import { MovieDashboard } from "@/components/movie-dashboard";
import { toast } from "sonner";
import {getStorage} from "@/utils/storage";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import Image from "next/image";
import {Badge} from "@/components/ui/badge";
import moment from "moment-timezone";
import {usePathname} from "next/navigation";

const TMDB_API_KEY = "84bef04731b60d2f1bd0f851679b2ec5";
const TMDB_API_URL = "https://api.themoviedb.org/3";

export function MovieSearch() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState({});
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [isEditStorage, setIsEditStorage] = useState(false);
  const { theme, setTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
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

  const searchMovies = async (e?:string) => {
    const query = e || inputRef.current?.value || "";
    const isNumeric = /^\d+$/.test(query);

    if (!query.trim()) {
      toast.error("Por favor, digite um termo para busca ou forneça um ID");
      return;
    }

    setLoading(true);
    try {
      const params = {
        language: "pt-BR",
        api_key: TMDB_API_KEY
      }
      const response = isNumeric
          ? await axios.get(`${TMDB_API_URL}/movie/${query}`, {params})
          : await axios.get(`${TMDB_API_URL}/search/movie`, {params: {...params, query: encodeURIComponent(query)}});
      setMovies(isNumeric ? [response.data] : response.data.results);
    } catch (error) {
      toast.error("Erro ao buscar filmes");
      console.error("Erro ao buscar filmes:", error);
    }
    setLoading(false);
  };

  const handlePaste = (event: ClipboardEvent) => {
    const text = event.clipboardData?.getData("text");
    if (!text) return;

    if (inputRef.current) {
      inputRef.current.value = text;
      buttonRef.current?.focus();
    }
  };
  const fetchCountries = async () => {
    try {
      const params = {
        language: "pt-BR",
        api_key: TMDB_API_KEY
      }
      const response = await axios.get(`${TMDB_API_URL}/configuration/countries`, {params});
      setCountries(response.data);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar países:", error);
      throw error;
    }
  };

  const handleCopyToClipboard = (text: any) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Texto copiado para a área de transferência!");
    }).catch((error) => {
      console.error("Erro ao copiar texto:", error);
      toast.error("Erro ao copiar texto");
    });
  };

  useEffect(() => {
    fetchGenres();
    fetchCountries();
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, []);
  return (
      <div className="space-y-8">
        <div className={"border-b-2"}>
          <div className={"container mx-auto pt-6 py-3 "}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Film className="h-8 w-8"/>
                <h1 className="text-3xl font-bold">Busca de Filmes</h1>
                {pathname === "/p2p" &&
                    <div>
                      <Badge>P2P</Badge>
                    </div>
                }
              </div>
              <div className={"flex items-center"}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"/>
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const storageValue = getStorage("movies_1");

                      handleCopyToClipboard(JSON.stringify(storageValue));
                    }}
                >
                  <Save className="h-5 w-5"/>
                </Button >

                {/*<Button variant="ghost"*/}
                {/*        size="icon"*/}
                {/*        onClick={() => {*/}
                {/*          setIsEditStorage(true)*/}
                {/*        }}*/}
                {/*>*/}
                {/*  ADD*/}
                {/*</Button>*/}
                {/*<Dialog open={isEditStorage} onOpenChange={() => setIsEditStorage(false)}>*/}
                {/*  <DialogContent>*/}
                {/*    <DialogHeader>*/}
                {/*      <DialogTitle>Teste</DialogTitle>*/}
                {/*    </DialogHeader>*/}
                {/*    <div className="grid gap-4">*/}
                {/*      <textarea*/}
                {/*          name="storage"*/}
                {/*          rows={10}*/}
                {/*          id="storageTextarea"*/}
                {/*          defaultValue={JSON.stringify(getStorage("movies_1"), null, 2)}*/}
                {/*      />*/}
                {/*    </div>*/}
                {/*  </DialogContent>*/}
                {/*</Dialog>*/}

              </div>

            </div>
          </div>
        </div>


        <div className={"sticky top-0 bg-card z-10"}>
          <div className={"container mx-auto py-6"}>
            <MovieDashboard/>
            <div className="flex gap-4 mt-5">
              <Input
                  placeholder="Digite o nome ou ID do filme"
                  ref={inputRef}
                  onKeyPress={(e) => e.key === "Enter" && searchMovies()}
              />
              <Button onClick={() => searchMovies()} ref={buttonRef} disabled={loading}>
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
            <MovieTable movies={movies} countries={countries} genres={genres} onSearch={(e: string) => {
              searchMovies(e)
            }}/>
          </motion.div>
        </AnimatePresence>
      </div>
  );
}