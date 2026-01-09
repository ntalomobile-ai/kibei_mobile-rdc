/// KiBei Mobile RDC - Application Flutter
/// Consomme uniquement l'API HTTP (apps/api)
/// Partage i18n et config avec le reste du monorepo

import 'package:flutter/material.dart';
import 'package:riverpod/riverpod.dart';

void main() {
  runApp(
    const ProviderScope(
      child: KiBeiMobileApp(),
    ),
  );
}

class KiBeiMobileApp extends StatelessWidget {
  const KiBeiMobileApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'KiBei Mobile RDC',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      home: const HomePage(),
    );
  }
}

/// Page d'accueil temporaire
class HomePage extends StatelessWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('KiBei Mobile RDC - Phase 2'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Bienvenue dans KiBei Mobile',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            Text(
              'Suivi des prix et taux de change en RDC',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Phase 2 - En développement...'),
                  ),
                );
              },
              child: const Text('Connexion'),
            ),
          ],
        ),
      ),
    );
  }
}
