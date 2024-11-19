"use client";

import { useEffect, useState } from "react";
import moment from "moment-timezone";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import {getStorage} from "@/utils/storage";
import {MovieStorage, STORAGE_MOVIES_DONE} from "@/components/movie-table";

interface MovieStats {
  today: number;
  yesterday: number;
  week: number;
  month: number;
}

export function MovieDashboard() {
  const [stats, setStats] = useState<MovieStats>({
    today: 0,
    yesterday: 0,
    week: 0,
    month: 0,
  });

  const movies: (MovieStorage | null)[] = getStorage(STORAGE_MOVIES_DONE);

  const calculateStats = (movies: Array<MovieStorage>) => {
    const now = moment().tz("America/Sao_Paulo");

    const format =  "DD/MM/YYYY HH:mm:ss";
    console.log( movies);

    const today = movies.filter((movie) =>
        moment(movie.updated_at, format).isSame(now, "day")
    ).length;


    const yesterday = movies.filter((movie) =>
        moment(movie.updated_at, format).isSame(now.clone().subtract(1, "day"), "day")
    ).length;

    const week = movies.filter((movie) =>
        moment(movie.updated_at, format).isAfter(now.clone().subtract(1, "week"))
    ).length;

    const month = movies.filter((movie) =>
        moment(movie.updated_at, format).isAfter(now.clone().subtract(1, "month"))
    ).length;

    setStats({ today, yesterday, week, month });
  };



  useEffect(() => {
    if (movies) {
      const validMovies: MovieStorage[] = movies.filter((movie): movie is MovieStorage => movie !== null);
      calculateStats(validMovies);


      const handleLocalStorageChange = () => {
        const updatedMovies: MovieStorage[] = getStorage(STORAGE_MOVIES_DONE).filter(
            (movie: any): movie is MovieStorage => movie !== null
        );
        calculateStats(updatedMovies);
      };

      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function (key, value) {
        const event = new Event('localStorageChange');
        originalSetItem.apply(this, [key, value]);
        window.dispatchEvent(event);
      };

      window.addEventListener('localStorageChange', handleLocalStorageChange);

      return () => {
        window.removeEventListener('localStorageChange', handleLocalStorageChange);
        localStorage.setItem = originalSetItem; // Restaurar comportamento original
      };
    }


  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ontem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.yesterday}</div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.week}</div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.month}</div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}