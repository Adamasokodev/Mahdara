<?php

namespace App\Filament\Resources\Cheikhs\Schemas;

use Filament\Infolists\Components\ImageEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class CheikhInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('user.prenom')
                    ->label('Prénom'),
                TextEntry::make('user.name')
                    ->label('Nom'),
                TextEntry::make('user.email')
                    ->label('E-mail'),
                TextEntry::make('user.telephone')
                    ->label('Téléphone')
                    ->placeholder('Non renseigné'),
                TextEntry::make('user.status')
                    ->label('Statut du compte')
                    ->badge(),
                TextEntry::make('mahdara.nom')
                    ->label('Mahdara'),
                ImageEntry::make('photo_path')
                    ->label('Photo du cheikh')
                    ->disk('public')
                    ->height(120),
                TextEntry::make('verifier')
                    ->label('Profil vérifié')
                    ->badge(),
                TextEntry::make('matieres.nom')
                    ->label('Matières enseignées')
                    ->bulleted(),
                TextEntry::make('bio')
                    ->label('Biographie')
                    ->placeholder('Aucune biographie renseignée')
                    ->columnSpanFull(),
                TextEntry::make('cours_count')
                    ->label('Cours publiés')
                    ->state(fn ($record): int => $record->cours()->count()),
            ]);
    }
}
