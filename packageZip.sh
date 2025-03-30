#!/bin/bash

# Créer un dossier temporaire pour le contenu
mkdir -p temp

# Copier les fichiers et dossiers nécessaires
cp -r module static templates temp/
cp system.json temp/
cp template.json temp/
cp README.md temp/
cp LICENSE.txt temp/
cp CHANGELOG.md temp/

# Créer le zip
cd temp
zip -r ../insmv.zip .

# Nettoyer le dossier temporaire
cd ..
rm -rf temp

echo "Le fichier insmv.zip a été créé avec succès."