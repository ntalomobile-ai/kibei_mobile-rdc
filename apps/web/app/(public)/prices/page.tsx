'use client';

import { useTranslation } from '@/hooks';
import { useState, useEffect, useMemo } from 'react';
import { fetchPrices, fetchProvinces, fetchCities, fetchMarkets, fetchProducts } from '@/lib/api';
import { Card, Loading, ErrorAlert, Badge, Input, Select, Button } from '@kibei/ui';
import { formatPrice, formatDate } from '@kibei/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function toNumber(v: any): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return Number(v);
  if (typeof v === 'bigint') return Number(v);
  if (typeof v?.toString === 'function') return Number(v.toString());
  return Number(v);
}

export default function PricesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [prices, setPrices] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedMarket, setSelectedMarket] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Charger les données initiales
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError('');
        const [pricesData, provincesData, productsData] = await Promise.all([
          fetchPrices({ take: 500 }),
          fetchProvinces(),
          fetchProducts(),
        ]);
        setPrices(pricesData.data || []);
        setProvinces(provincesData.data || []);
        setProducts(productsData.data || []);
      } catch (err) {
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Charger les villes quand une province est sélectionnée
  useEffect(() => {
    async function loadCities() {
      if (selectedProvince === 'all') {
        setCities([]);
        setMarkets([]);
        return;
      }
      try {
        const citiesData = await fetchCities({ provinceId: selectedProvince });
        setCities(citiesData.data || []);
        setSelectedCity('all');
        setSelectedMarket('all');
      } catch (err) {
        console.error('Erreur lors du chargement des villes:', err);
      }
    }
    loadCities();
  }, [selectedProvince]);

  // Charger les marchés quand une ville est sélectionnée
  useEffect(() => {
    async function loadMarkets() {
      if (selectedCity === 'all') {
        setMarkets([]);
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
        if (selectedCategory !== 'all') params.category = selectedCategory;
        // La recherche sera effectuée côté client

        const pricesData = await fetchPrices(params);
        setPrices(pricesData.data || []);
      } catch (err) {
        setError('Erreur lors du chargement des prix');
      } finally {
        setLoading(false);
      }
    }
    loadFilteredPrices();
  }, [selectedProvince, selectedCity, selectedMarket, selectedCategory]);

  // Extraire les catégories uniques
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ['all', ...Array.from(cats).sort()];
  }, [products]);

  // Dédupliquer les prix : garder seulement le plus récent par produit+marché
  // et appliquer la recherche textuelle
  const uniquePrices = useMemo(() => {
    const map = new Map<string, any>();
    // prices est déjà trié par createdAt desc (le plus récent en premier)
    for (const p of prices) {
      const key = `${p.productId}-${p.marketId}`;
      if (!map.has(key)) {
        map.set(key, p);
      }
    }
    let filtered = Array.from(map.values());

    // Appliquer la recherche textuelle côté client
    if (searchQuery.trim()) {
      const searchLower = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((p) => {
        const searchableText = [
          p.product?.nameFr,
          p.product?.nameSw,
          p.product?.nameLn,
          p.market?.nameFr,
          p.market?.city?.nameFr,
          p.market?.city?.province?.nameFr,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return searchableText.includes(searchLower);
      });
    }

    return filtered;
  }, [prices, searchQuery]);

  // Grouper les prix par catégorie
  const pricesByCategory = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    uniquePrices.forEach((price) => {
      const cat = price.product?.category || 'Autre';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(price);
    });
    return grouped;
  }, [uniquePrices]);

  if (loading && prices.length === 0) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-2">
          Consultation des Prix
        </h1>
        <p className="text-slate-300/80">
          Explorez les prix des produits à travers toute la République Démocratique du Congo
        </p>
      </div>

      {error && <ErrorAlert message={error} className="mb-6" />}

      {/* Barre de recherche et filtres */}
      <Card className="p-6 mb-6 bg-white/5 border-white/10">
        <div className="space-y-4">
          {/* Recherche textuelle */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Rechercher un produit, marché ou ville
            </label>
            <Input
              type="text"
              placeholder="Ex: Maïs, Marché Central, Kinshasa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtre par catégorie */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Catégorie
              </label>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'Toutes les catégories' : cat}
                  </option>
                ))}
              </Select>
            </div>

            {/* Filtre par province */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
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

            {/* Filtre par ville */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
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

            {/* Filtre par marché */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
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

          {/* Boutons de vue */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-slate-300/70">
              {uniquePrices.length} {uniquePrices.length > 1 ? 'produits trouvés' : 'produit trouvé'}
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grille
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                Liste
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Résultats */}
      {uniquePrices.length === 0 ? (
        <Card className="p-12 text-center bg-white/5 border-white/10">
          <p className="text-slate-300/80 text-lg">
            Aucun prix trouvé avec les filtres sélectionnés.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedProvince('all');
              setSelectedCity('all');
              setSelectedMarket('all');
            }}
          >
            Réinitialiser les filtres
          </Button>
        </Card>
      ) : selectedCategory === 'all' && searchQuery === '' ? (
        // Vue par catégorie si aucun filtre spécifique
        <div className="space-y-8">
          {Object.entries(pricesByCategory).map(([category, categoryPrices]) => (
            <div key={category}>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span>{category}</span>
                <Badge variant="secondary">{categoryPrices.length}</Badge>
              </h2>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryPrices.map((price: any) => (
                    <PriceCard key={price.id} price={price} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {categoryPrices.map((price: any) => (
                    <PriceListItem key={price.id} price={price} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Vue filtrée
        <div>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uniquePrices.map((price: any) => (
                <PriceCard key={price.id} price={price} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {uniquePrices.map((price: any) => (
                <PriceListItem key={price.id} price={price} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Composant pour la carte de prix (vue grille)
function PriceCard({ price }: { price: any }) {
  const router = useRouter();
  const currentPrice = toNumber(price.price);
  
  return (
    <Card
      className="p-5 bg-white/5 border-white/10 hover:bg-white/10 transition cursor-pointer"
      onClick={() => router.push(`/app/item/${price.id}`)}
    >
      <div className="flex justify-between items-start gap-4 mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">
            {price.product?.nameFr}
          </h3>
          <Badge variant="outline" className="text-xs mb-2">
            {price.product?.category}
          </Badge>
          <p className="text-slate-300/80 text-sm mt-2">
            {price.market?.nameFr}
          </p>
          <p className="text-slate-300/60 text-xs">
            {price.market?.city?.nameFr}
            {price.market?.city?.province?.nameFr && `, ${price.market.city.province.nameFr}`}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {formatPrice(currentPrice, price.currency)}
          </div>
          <div className="text-xs text-slate-300/70 mt-1">
            / {price.product?.unitFr || 'unité'}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-300/70 pt-3 border-t border-white/10">
        <span>Mis à jour {formatDate(price.createdAt)}</span>
        <Link
          href={`/app/item/${price.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-blue-400 hover:text-blue-300 underline"
        >
          Voir l'historique →
        </Link>
      </div>
    </Card>
  );
}

// Composant pour l'élément de liste
function PriceListItem({ price }: { price: any }) {
  const router = useRouter();
  const currentPrice = toNumber(price.price);
  
  return (
    <Card
      className="p-4 bg-white/5 border-white/10 hover:bg-white/10 transition cursor-pointer"
      onClick={() => router.push(`/app/item/${price.id}`)}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-white">
              {price.product?.nameFr}
            </h3>
            <Badge variant="outline" className="text-xs">
              {price.product?.category}
            </Badge>
          </div>
          <div className="text-sm text-slate-300/80">
            <span className="font-medium">{price.market?.nameFr}</span>
            <span className="mx-2">•</span>
            <span>{price.market?.city?.nameFr}</span>
            {price.market?.city?.province?.nameFr && (
              <>
                <span className="mx-2">•</span>
                <span>{price.market.city.province.nameFr}</span>
              </>
            )}
          </div>
          <div className="text-xs text-slate-300/60 mt-1">
            Mis à jour {formatDate(price.createdAt)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {formatPrice(currentPrice, price.currency)}
          </div>
          <div className="text-xs text-slate-300/70 mt-1">
            / {price.product?.unitFr || 'unité'}
          </div>
          <Link
            href={`/app/item/${price.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-blue-400 hover:text-blue-300 underline text-xs mt-2 inline-block"
          >
            Voir l'historique →
          </Link>
        </div>
      </div>
    </Card>
  );
}
