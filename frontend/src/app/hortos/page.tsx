"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { hortosProximos } from "@/lib/api/hortos";
import type { HortosProximosResponse } from "@/lib/api/types";
import { StatusHortoBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { LoadingBlock, ErrorBlock } from "@/components/ui/Spinner";
import { mensagemErro } from "@/lib/format";

const HortoMap = dynamic(() => import("@/components/map/HortoMap").then((m) => m.HortoMap), {
  ssr: false,
  loading: () => <LoadingBlock />,
});

export default function HortosPage() {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [dados, setDados] = useState<HortosProximosResponse | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function buscarComCoordenadas(latitude: number, longitude: number) {
    setCarregando(true);
    setErro(null);
    try {
      const resultado = await hortosProximos({ lat: latitude, lon: longitude });
      setDados(resultado);
      setLat(String(latitude));
      setLon(String(longitude));
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setCarregando(false);
    }
  }

  function usarGeolocalizacao() {
    if (!navigator.geolocation) {
      setErro("Geolocalização não é suportada neste navegador.");
      return;
    }
    setCarregando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => buscarComCoordenadas(pos.coords.latitude, pos.coords.longitude),
      () => {
        setCarregando(false);
        setErro("Não foi possível obter sua localização. Informe manualmente abaixo.");
      }
    );
  }

  function buscarManual(e: React.FormEvent) {
    e.preventDefault();
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      setErro("Informe latitude e longitude válidas.");
      return;
    }
    buscarComCoordenadas(latitude, longitude);
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">Hortos medicinais</h1>
        <p className="max-w-2xl text-sm text-stone-600 dark:text-stone-400">
          Encontre o horto parceiro mais próximo de você, ordenado por distância real.
        </p>
      </section>

      <Card className="flex flex-col gap-4 p-4">
        <Button onClick={usarGeolocalizacao} disabled={carregando}>
          📍 Usar minha localização
        </Button>
        <form onSubmit={buscarManual} className="flex flex-wrap items-end gap-3">
          <FormField
            label="Latitude"
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="-8.167"
          />
          <FormField
            label="Longitude"
            type="number"
            step="any"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            placeholder="-35.012"
          />
          <Button type="submit" variant="secondary" disabled={carregando}>
            Buscar manualmente
          </Button>
        </form>
      </Card>

      {carregando && <LoadingBlock />}
      {erro && <ErrorBlock mensagem={erro} />}

      {dados && (
        <>
          <div className="h-96 w-full overflow-hidden rounded-xl">
            <HortoMap origem={dados.origem} features={dados.features} />
          </div>

          <div className="flex flex-col gap-3">
            {dados.features.map((feature) => (
              <Card key={feature.properties.id} id={`horto-${feature.properties.id}`} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                      {feature.properties.nome}
                    </h3>
                    <p className="text-sm text-stone-500">{feature.properties.instituicao_nome}</p>
                    <p className="text-sm text-stone-500">
                      {feature.properties.logradouro} — {feature.properties.municipio}/{feature.properties.uf}
                    </p>
                    {feature.properties.horario_funcionamento && (
                      <p className="text-sm text-stone-500">
                        Funcionamento: {feature.properties.horario_funcionamento}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusHortoBadge status={feature.properties.status} />
                    {feature.properties.distancia_km != null && (
                      <span className="text-sm font-medium text-primary-700">
                        {feature.properties.distancia_km} km
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            {dados.features.length === 0 && (
              <p className="py-8 text-center text-sm text-stone-500">Nenhum horto encontrado.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
