'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchCities, fetchPrices, fetchProvinces, fetchMarkets } from '@/lib/api';
import { Badge, Card, ErrorAlert, Input, Loading, Select } from '@kibei/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { svgThumb } from '../_components/thumb';
import { formatPrice, formatDate } from '@kibei/utils';

function toNumber(v: any): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return Number(v);
  if (typeof v?.toString === 'function') return Number(v.toString());
  return Number(v);
}

export default function PublicExplorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prices, setPrices] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);
  
  // Filtres
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedMarket, setSelectedMarket] = useState<string>('all');
  const [mode, setMode] = useState<'products' | 'cities'>('products');

  // Charger les données initiales
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [p, prov] = await Promise.all([
          fetchPrices({ take: 500 }),
          fetchProvinces(),
        ]);
        setPrices(p.data || []);
        setProvinces(prov.data || []);
      } catch {
        setError('Impossible de charger les prix.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Charger les villes quand une province est sélectionnée ou pour le mode cities
  useEffect(() => {
    async function loadCities() {
      if (mode === 'cities' && cities.length === 0 && selectedProvince === 'all') {
        // Charger toutes les villes pour le mode cities
        try {
          const citiesData = await fetchCities();
          setCities(citiesData.data || []);
        } catch (err) {
          console.error('Erreur lors du chargement des villes:', err);
        }
      } else if (selectedProvince === 'all') {
        setCities([]);
        setMarkets([]);
        setSelectedCity('all');
        setSelectedMarket('all');
        return;
      } else if (selectedProvince !== 'all') {
        try {
          const citiesData = await fetchCities({ provinceId: selectedProvince });
          setCities(citiesData.data || []);
          setSelectedCity('all');
          setSelectedMarket('all');
        } catch (err) {
          console.error('Erreur lors du chargement des villes:', err);
        }
      }
    }
    loadCities();
  }, [selectedProvince, mode]);

  // Charger les marchés quand une ville est sélectionnée
  useEffect(() => {
    async function loadMarkets() {
      if (selectedCity === 'all') {
        setMarkets([]);
        setSelectedMarket('all');
        return;
      }
      try {
        const marketsData = await fetchMarkets({ cityId: selectedCity });
        setMarkets(marketsData.data || []);
        setSelectedMarket('all');
      } catch (err) {
        console.error('Erreur lors du chargement des marchés:', err);
      }
    }
    loadMarkets();
  }, [selectedCity]);

  // Charger les prix avec les filtres
  useEffect(() => {
    async function loadFilteredPrices() {
      try {
        setLoading(true);
        const params: any = {
          take: 500,
        };
        if (selectedProvince !== 'all') params.provinceId = selectedProvince;
        if (selectedCity !== 'all') params.cityId = selectedCity;
        if (selectedMarket !== 'all') params.marketId = selectedMarket;
        if (category !== 'all') params.category = category;

        const pricesData = await fetchPrices(params);
        setPrices(pricesData.data || []);
      } catch (err) {
        setError('Erreur lors du chargement des prix');
      } finally {
        setLoading(false);
      }
    }
    loadFilteredPrices();
  }, [selectedProvince, selectedCity, selectedMarket, category]);

  // Extraire les catégories uniques
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of prices) {
      if (p.product?.category) set.add(String(p.product.category));
    }
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [prices]);

  // Grouper les prix par produit (un produit unique avec tous ses prix)
  const productsGrouped = useMemo(() => {
    const productMap = new Map<string, {
      product: any;
      prices: any[];
      minPrice: number;
      maxPrice: number;
      avgPrice: number;
    }>();

    for (const price of prices) {
      const productId = price.productId;
      if (!productId || !price.product) continue;

      if (!productMap.has(productId)) {
        productMap.set(productId, {
          product: price.product,
          prices: [],
          minPrice: Infinity,
          maxPrice: -Infinity,
          avgPrice: 0,
        });
      }

      const entry = productMap.get(productId)!;
      const priceValue = toNumber(price.price);
      entry.prices.push(price);
      
      if (priceValue < entry.minPrice) entry.minPrice = priceValue;
      if (priceValue > entry.maxPrice) entry.maxPrice = priceValue;
    }

    // Calculer la moyenne pour chaque produit
    for (const entry of productMap.values()) {
      if (entry.prices.length > 0) {
        const sum = entry.prices.reduce((acc, p) => acc + toNumber(p.price), 0);
        entry.avgPrice = sum / entry.prices.length;
      }
    }

    return Array.from(productMap.values());
  }, [prices]);

  // Filtrer les produits groupés
  const filteredProducts = useMemo(() => {
    let filtered = productsGrouped;

    // Filtrer par catégorie
    if (category !== 'all') {
      filtered = filtered.filter(p => p.product.category === category);
    }

    // Filtrer par recherche textuelle
    if (q.trim()) {
      const searchLower = q.trim().toLowerCase();
      filtered = filtered.filter(p => {
        const searchableText = [
          p.product.nameFr,
          p.product.nameSw,
          p.product.nameLn,
        ].filter(Boolean).join(' ').toLowerCase();
        return searchableText.includes(searchLower);
      });
    }

    // Filtrer par localisation (si un filtre géographique est actif)
    if (selectedProvince !== 'all' || selectedCity !== 'all' || selectedMarket !== 'all') {
      filtered = filtered.map(p => {
        const filteredPrices = p.prices.filter(price => {
          if (selectedMarket !== 'all' && price.marketId !== selectedMarket) return false;
          if (selectedCity !== 'all' && price.market?.cityId !== selectedCity) return false;
          if (selectedProvince !== 'all' && price.market?.city?.provinceId !== selectedProvince) return false;
          return true;
        });
        return { ...p, prices: filteredPrices };
      }).filter(p => p.prices.length > 0);
    }

    return filtered;
  }, [productsGrouped, category, q, selectedProvince, selectedCity, selectedMarket]);

  if (loading && prices.length === 0) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Explorer</h1>
        <p className="text-slate-300/80">Trouvez les meilleurs prix à travers toute la RDC.</p>
      </div>

      {/* Onglets Produits / Taux de change */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('products')}
          className={`px-3 py-1.5 rounded-xl border text-sm transition ${
            mode === 'products'
              ? 'bg-white/10 border-white/15 text-white'
              : 'border-white/10 text-slate-300/80 hover:text-white hover:bg-white/5'
          }`}
        >
          Produits
        </button>
        <button
          onClick={() => setMode('cities')}
          className={`px-3 py-1.5 rounded-xl border text-sm transition ${
            mode === 'cities'
              ? 'bg-white/10 border-white/15 text-white'
              : 'border-white/10 text-slate-300/80 hover:text-white hover:bg-white/5'
          }`}
        >
          Taux de change par Villes
        </button>
      </div>

      {mode === 'products' && (
        <>
          {/* Barre de recherche */}
          <div className="flex gap-3 flex-wrap items-center">
            <div className="flex-1 min-w-[220px]">
              <Input 
                placeholder="Rechercher un produit..." 
                value={q} 
                onChange={(e) => setQ(e.target.value)} 
              />
            </div>
          </div>

          {/* Filtres par catégorie */}
          <div className="flex gap-2 overflow-auto max-w-full pb-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-full text-sm border transition whitespace-nowrap ${
                  c === category
                    ? 'bg-white/10 border-white/15 text-white'
                    : 'border-white/10 text-slate-300/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {c === 'all' ? 'Tout' : c}
              </button>
            ))}
          </div>

          {/* Filtres géographiques */}
          <Card className="p-4 bg-white/5 border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1.5">
                  Province
                </label>
                <Select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                >
                  <option value="all">Toutes les provinces</option>
                  {provinces.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.nameFr}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1.5">
                  Ville
                </label>
                <Select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={selectedProvince === 'all'}
                >
                  <option value="all">Toutes les villes</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.nameFr}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1.5">
                  Marché
                </label>
                <Select
                  value={selectedMarket}
                  onChange={(e) => setSelectedMarket(e.target.value)}
                  disabled={selectedCity === 'all'}
                >
                  <option value="all">Tous les marchés</option>
                  {markets.map((market) => (
                    <option key={market.id} value={market.id}>
                      {market.nameFr}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Compteur de résultats */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
              <div className="text-xs text-slate-300/70">
                {filteredProducts.length} {filteredProducts.length > 1 ? 'produits trouvés' : 'produit trouvé'}
              </div>
              {(selectedProvince !== 'all' || selectedCity !== 'all' || selectedMarket !== 'all' || category !== 'all' || q) && (
                <button
                  onClick={() => {
                    setSelectedProvince('all');
                    setSelectedCity('all');
                    setSelectedMarket('all');
                    setCategory('all');
                    setQ('');
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </Card>
        </>
      )}

      {error && <ErrorAlert message={error} />}

      {/* Affichage des résultats */}
      <div className="space-y-3">
        {mode === 'cities' ? (
          // Mode villes (taux de change)
          <CitiesList cities={cities} searchQuery={q} selectedProvince={selectedProvince} />
        ) : filteredProducts.length === 0 ? (
          <Card className="p-8 text-center bg-white/5 border-white/10">
            <p className="text-slate-300/80">
              Aucun produit trouvé avec les filtres sélectionnés.
            </p>
          </Card>
        ) : (
          // Vue par catégorie avec produits groupés
          (() => {
            // Grouper les produits filtrés par catégorie
            const byCategory: Record<string, typeof filteredProducts> = {};
            for (const product of filteredProducts) {
              const cat = product.product.category || 'Autre';
              if (!byCategory[cat]) byCategory[cat] = [];
              byCategory[cat].push(product);
            }

            return Object.entries(byCategory).map(([cat, products]) => (
              <div key={cat}>
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span>{cat}</span>
                  <Badge variant="secondary" className="text-xs">
                    {products.length}
                  </Badge>
                </h2>
                <div className="space-y-3">
                  {products.map((productGroup) => (
                    <ProductCard 
                      key={productGroup.product.id} 
                      productGroup={productGroup} 
                    />
                  ))}
                </div>
              </div>
            ));
          })()
        )}
      </div>
    </div>
  );
}

// Composant pour afficher un produit avec ses différents prix
function ProductCard({ productGroup }: { productGroup: {
  product: any;
  prices: any[];
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
} }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const { product, prices } = productGroup;

  // Grouper les prix par province → ville → marché (garder seulement le plus récent par marché)
  const pricesByLocation = useMemo(() => {
    // D'abord, garder seulement le prix le plus récent pour chaque marché
    const marketMap = new Map<string, any>();
    for (const price of prices) {
      const marketId = price.marketId;
      if (!marketId) continue;
      
      const existing = marketMap.get(marketId);
      if (!existing) {
        marketMap.set(marketId, price);
      } else {
        // Comparer les dates pour garder le plus récent
        const existingDate = new Date(existing.createdAt || existing.validatedAt || 0);
        const currentDate = new Date(price.createdAt || price.validatedAt || 0);
        if (currentDate > existingDate) {
          marketMap.set(marketId, price);
        }
      }
    }

    // Ensuite, organiser par province → ville
    const byProvince: Record<string, Record<string, any[]>> = {};
    
    for (const price of marketMap.values()) {
      const provinceName = price.market?.city?.province?.nameFr || 'Autre';
      const cityName = price.market?.city?.nameFr || 'Autre';
      
      if (!byProvince[provinceName]) {
        byProvince[provinceName] = {};
      }
      if (!byProvince[provinceName][cityName]) {
        byProvince[provinceName][cityName] = [];
      }
      
      byProvince[provinceName][cityName].push(price);
    }

    // Trier les provinces et villes
    const sorted: Array<{
      province: string;
      cities: Array<{
        city: string;
        prices: any[];
      }>;
    }> = [];

    for (const [province, cities] of Object.entries(byProvince).sort((a, b) => a[0].localeCompare(b[0]))) {
      const cityEntries = Object.entries(cities)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([city, prices]) => ({
          city,
          prices: prices.sort((a, b) => {
            // Trier les marchés par nom
            return (a.market?.nameFr || '').localeCompare(b.market?.nameFr || '');
          }),
        }));
      
      sorted.push({ province, cities: cityEntries });
    }

    return sorted;
  }, [prices]);

  return (
    <Card className="p-4 bg-white/5 border-white/10">
      {/* En-tête du produit */}
      <div 
        className="flex items-center gap-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <img
          src={product.imageUrl || svgThumb(product.nameFr || 'Produit')}
          alt={product.nameFr || 'Produit'}
          className="h-14 w-14 rounded-2xl ring-1 ring-white/10 bg-white/5 object-cover"
        />
        <div className="flex-1">
          <div className="text-white font-semibold text-lg">{product.nameFr}</div>
          <div className="text-xs text-slate-300/70 mt-1">
            {product.category} • {product.unitFr}
          </div>
          <div className="text-xs text-slate-300/60 mt-1">
            {new Set(prices.map(p => p.marketId)).size} {new Set(prices.map(p => p.marketId)).size > 1 ? 'marchés' : 'marché'} 
            {' '}dans {new Set(prices.map(p => p.market?.city?.provinceId)).size} {new Set(prices.map(p => p.market?.city?.provinceId)).size > 1 ? 'provinces' : 'province'}
          </div>
        </div>
        <div className="text-right">
          {productGroup.minPrice !== Infinity && productGroup.maxPrice !== -Infinity && (
            <>
              <div className="text-sm text-slate-300/70">Prix min</div>
              <div className="text-lg font-semibold text-white">
                {formatPrice(productGroup.minPrice, prices[0]?.currency || 'CDF')}
              </div>
              <div className="text-sm text-slate-300/70 mt-1">Prix max</div>
              <div className="text-lg font-semibold text-white">
                {formatPrice(productGroup.maxPrice, prices[0]?.currency || 'CDF')}
              </div>
            </>
          )}
        </div>
        <button className="text-slate-300/60 text-xl">
          {expanded ? '▼' : '▶'}
        </button>
      </div>

      {/* Liste des prix organisés par province → ville → marché (expandable) */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
          {pricesByLocation.length === 0 ? (
            <p className="text-sm text-slate-300/70 text-center py-4">
              Aucun prix disponible pour ce produit.
            </p>
          ) : (
            pricesByLocation.map(({ province, cities }) => (
              <div key={province} className="space-y-3">
                {/* En-tête de province */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px flex-1 bg-white/10" />
                  <h3 className="text-sm font-semibold text-white px-2">
                    {province}
                  </h3>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                {/* Liste des villes dans cette province */}
                {cities.map(({ city, prices: cityPrices }) => (
                  <div key={`${province}-${city}`} className="space-y-2 ml-2">
                    {/* En-tête de ville */}
                    <div className="text-xs font-medium text-slate-300/80 mb-1">
                      {city}
                    </div>

                    {/* Liste des marchés dans cette ville */}
                    {cityPrices.map((price) => {
                      const priceValue = toNumber(price.price);
                      const market = price.market?.nameFr || '';
                      
                      return (
                        <div
                          key={price.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer ml-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/app/item/${price.id}`);
                          }}
                        >
                          <div className="flex-1">
                            <div className="text-white font-medium">{market}</div>
                            <div className="text-xs text-slate-300/60 mt-1">
                              Mis à jour {formatDate(price.createdAt || price.validatedAt)}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="default" className="text-sm font-semibold">
                              {formatPrice(priceValue, price.currency)}
                            </Badge>
                            <div className="text-xs text-blue-400 hover:text-blue-300 mt-1">
                              Voir détails →
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
}

// Composant pour afficher la liste des villes (mode taux de change)
function CitiesList({ cities, searchQuery, selectedProvince }: { 
  cities: any[]; 
  searchQuery: string;
  selectedProvince: string;
}) {
  const filtered = useMemo(() => {
    let filteredCities = cities;
    
    if (selectedProvince !== 'all') {
      filteredCities = filteredCities.filter(c => c.provinceId === selectedProvince);
    }
    
    if (searchQuery.trim()) {
      const s = searchQuery.trim().toLowerCase();
      filteredCities = filteredCities.filter((c: any) => {
        const hay = [c.nameFr, c.province?.nameFr, c.province?.code].filter(Boolean).join(' ').toLowerCase();
        return hay.includes(s);
      });
    }
    
    return filteredCities;
  }, [cities, searchQuery, selectedProvince]);

  if (filtered.length === 0) {
    return (
      <Card className="p-8 text-center bg-white/5 border-white/10">
        <p className="text-slate-300/80">Aucune ville trouvée.</p>
      </Card>
    );
  }

  return (
    <>
      {filtered.map((c: any) => (
        <Link key={c.id} href={`/app/city/${c.id}`}>
          <Card className="p-4 hover:bg-white/10 transition cursor-pointer">
            <div className="flex items-center gap-4">
              <img
                src={c.imageUrl || svgThumb(c.nameFr || c.code || 'Ville', '#FCD116')}
                alt={c.nameFr || 'Ville'}
                className="h-14 w-14 rounded-2xl ring-1 ring-white/10 bg-white/5 object-cover"
              />
              <div className="flex-1">
                <div className="text-white font-semibold">{c.nameFr}</div>
                <div className="text-xs text-slate-300/70 mt-1">
                  {c.province?.nameFr} • {(c.markets?.length ?? 0)} marchés
                </div>
              </div>
              <span className="text-slate-300/60 text-sm">›</span>
            </div>
          </Card>
        </Link>
      ))}
    </>
  );
}
