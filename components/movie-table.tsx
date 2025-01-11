"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import moment from "moment-timezone";
import "moment/locale/pt-br";
import {getStorage, setStorage} from "@/utils/storage";
import Image from "next/image";
import {usePathname} from "next/navigation";
import {STORAGE_MOVIES_DONE} from "@/components/theme-provider";

moment.locale("pt-br");

interface Genre {
  id: number;
  name: string;
}

interface Movie {
  origin_country?: string[];
  genres: Genre[];
  id: number;
  title: string;
  poster_path: string;
  genre_ids: number[];
  release_date: string;
  overview: string;
}

interface Country {
  english_name:string;
  iso_3166_1: string;
  native_name: string;
}

export interface MovieStorage {
  id: number;
  title: string;
  updated_at: string; // formato de data como string
  isDubbed: boolean;
}

interface MovieTableProps {
  movies: Movie[];
  genres: { [key: number]: string };
  countries: Country[];
  onSearch: (e:string | number) => void | any
}

const TMDB_IMG_URL = "https://image.tmdb.org/t/p/w185";

export function MovieTable({ movies, genres, countries, onSearch }: MovieTableProps) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [checkedMovies, setCheckedMovies] = useState<{ [key: number]: boolean }>(
    {}
  );

  const [teste, setTeste] = useState<MovieStorage[]>([]);
  const loadCheckedMovies = () => {
    const newCheckedMovies: { [key: number]: boolean } = {};

    const cachedMovies: Array<Movie | null> = getStorage(STORAGE_MOVIES_DONE);

    if (cachedMovies && cachedMovies?.length > 0) {
      cachedMovies.forEach((item: any) => {
        if (item.isDubbed) newCheckedMovies[item.id] = true;
      })
    }

    setCheckedMovies(newCheckedMovies);
  };



  const handleMovieCheck = (movie: Movie, checked: boolean) => {
    const newCheckedMovies = { ...checkedMovies };
    const cachedMoviesDone = getStorage(STORAGE_MOVIES_DONE);

    const movieData = {
      id: movie.id,
      title: movie.title,
      updated_at: moment().tz("America/Sao_Paulo").format("DD/MM/YYYY HH:mm:ss"),
      isDubbed: true,
    };

    if (cachedMoviesDone && cachedMoviesDone?.length > 0) {
      const index = cachedMoviesDone.findIndex((item: any) => item.id === movie.id);
      const filtered = cachedMoviesDone.filter((item:any) => item.id === movie.id);

      if (index !== -1) {
        const tr = cachedMoviesDone.findIndex((item: any) => item.id === movie.id && item.isDubbed);
        if (filtered.length === 2)  {
          cachedMoviesDone.splice(tr, 1);
        } else if (cachedMoviesDone[index].isDubbed === false) {
          cachedMoviesDone.unshift(movieData);
        } else {
          cachedMoviesDone.splice(index, 1);
        }
      } else {
        cachedMoviesDone.unshift(movieData);
      }
      setStorage(STORAGE_MOVIES_DONE, cachedMoviesDone);
    } else {
      setStorage(STORAGE_MOVIES_DONE, [movieData]);
    }

    if (checked) {
      newCheckedMovies[movie.id] = true;
    } else {
      delete newCheckedMovies[movie.id];
      const index = cachedMoviesDone.findIndex((item: any) => item.id === movie.id);
      if (index !== -1) {
        cachedMoviesDone.splice(index, 1);
      }
    }
    setCheckedMovies({ ...newCheckedMovies });
  };
  const handleDubbedChange = (movieId: number, isDubbed: boolean) => {
    const cachedMoviesDone: Array<MovieStorage> = getStorage(STORAGE_MOVIES_DONE);


    const filtered = cachedMoviesDone.filter((item) => item.id === movieId);

    if (filtered.length === 0) {
        cachedMoviesDone.unshift({
            id: movieId,
            title: movies.find((movie) => movie.id === movieId)?.title || "",
            updated_at: moment().tz("America/Sao_Paulo").format("DD/MM/YYYY HH:mm:ss"),
            isDubbed: false,
        });
    } else {
      const movieIndex = cachedMoviesDone.findIndex((item) => item.id === movieId && !item.isDubbed);
      if (movieIndex !== -1 && !cachedMoviesDone[movieIndex].isDubbed) {
        cachedMoviesDone.splice(movieIndex, 1);
      } else {
        cachedMoviesDone.unshift({
          id: movieId,
          title: movies.find((movie) => movie.id === movieId)?.title || "",
          updated_at: moment().tz("America/Sao_Paulo").format("DD/MM/YYYY HH:mm:ss"),
          isDubbed: false,
        });
      }
    }


    setTeste(() => cachedMoviesDone);
    setStorage(STORAGE_MOVIES_DONE, cachedMoviesDone);
  };

  const getGenres = (genreIds: number[]) => {
    return genreIds.map((id) => genres[id]).filter(Boolean);
  };
  const handleKeyDown = (event: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    if ((isMac && event.metaKey && event.key === 's') || (!isMac && event.ctrlKey && event.key === 's')) {
      event.preventDefault();
      if (movies.length > 0) {
        handleMovieCheck(movies[0], true);
      }
    }
  };

  useEffect(() => {
    const cachedMoviesDone = getStorage(STORAGE_MOVIES_DONE);
    setTeste(cachedMoviesDone)
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [movies]);

  useEffect(() => {
    loadCheckedMovies();
  }, []);
  return (
    <>
      <div className="rounded-md border">

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Categorias</TableHead>
              <TableHead>Data de Lançamento</TableHead>
              {/*<TableHead>Dublado</TableHead>*/}
              <TableHead>Ver detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movies.map((movie) => (
              <TableRow key={movie.id}>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <Checkbox
                        checked={checkedMovies[movie.id] || false}
                        id={`${movie.id}`}
                        onCheckedChange={(checked) =>
                          handleMovieCheck(movie, checked as boolean)
                        }
                        className="h-6 w-6 rounded-full border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                      {/*{checkedMovies[movie.id] && (*/}
                      {/*  <Check className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-white" />*/}
                      {/*)}*/}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-4">
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={
                        movie.poster_path
                          ? `${TMDB_IMG_URL}${movie.poster_path}`
                          : "/placeholder.png"
                      }
                      alt={movie.title}
                      className="h-32 w-24 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium text-lg max-w-[200px] mb-4">{movie.title}</p>
                      <p className={'font-sans  mb-5 cursor-pointer hover:text-pink-700 transition'} onClick={() => onSearch(`${movie.id}`)}>ID: {movie.id}</p>
                      <p className="max-w-[300px] line-clamp-4 mb-4">{movie.overview}</p>
                    </div>
                  </div>
                  {movie.origin_country &&
                      <div className={"mt-4 flex items-center"}>
                        <span className="font-bold mr-3">Origem: </span>
                        {" "}
                        <div className={'flex gap-1 mr-3 '}>
                          {movie.origin_country.map((item, index) => {
                            const country = countries.find(country => country.iso_3166_1 === item);
                            return (
                              <div key={index}>
                                {country?.iso_3166_1 === 'BR' ? (
                                  <Badge variant="success">
                                    <span>{country.english_name || item}</span>
                                  </Badge>
                                ) : (
                                  <span>{country?.english_name || item} ;</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                  }
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1" style={{maxWidth:300}}>
                    {movie.genre_ids ? getGenres(movie.genre_ids).map((genre, index) => (
                        <Badge key={index} variant="secondary">
                          {genre}
                        </Badge>
                    )) : movie.genres.map((item) => (
                        <Badge key={item.id} variant="secondary">
                          {item.name}
                        </Badge>
                    ))}

                  </div>
                </TableCell>
                <TableCell>
                  {moment(movie.release_date).format("DD/MM/YYYY")}
                </TableCell>
                {/*<TableCell>*/}
                {/*  <Switch*/}
                {/*    checked={dubbedStatus[movie.id] || false}*/}
                {/*    disabled={!checkedMovies[movie.id]}*/}
                {/*    onCheckedChange={(checked) =>*/}
                {/*      handleDubbedChange(movie.id, checked)*/}
                {/*    }*/}
                {/*  />*/}
                {/*</TableCell>*/}
                <TableCell className={'flex-col text-center flex-center  columns-1'}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedMovie(movie)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                  <div className="flex justify-center gap-2 mt-2">
                    <Button
                        variant={teste?.filter((item: any) => item.id === movie.id && !item.isDubbed).length > 0 ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleDubbedChange(movie.id, false)}
                    >
                      LEG
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {movies.length === 0 && <div className={"my-10 text-center"}><h1 className={"text-2xl"}>Digite para buscar</h1></div>}
      </div>

      <Dialog open={!!selectedMovie} onOpenChange={() => setSelectedMovie(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedMovie?.title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {selectedMovie?.poster_path && (
              <Image
                src={`${TMDB_IMG_URL}${selectedMovie.poster_path}`}
                alt={selectedMovie.title}
                width={200}
                height={200}
                className="w-[200px] mx-auto rounded-lg"
              />
            )}
            <div className="flex flex-wrap gap-2">
              {selectedMovie?.genre_ids?.map((genreId) => (
                <Badge key={genreId} variant="outline">
                  {genres[genreId]}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedMovie?.overview}
            </p>
            <p className="text-sm">
              Data de Lançamento:{" "}
              {moment(selectedMovie?.release_date).format("DD [de] MMMM [de] YYYY")}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}