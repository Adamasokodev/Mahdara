<?php

namespace App\Filament\Resources\Oeuvres\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class OeuvreForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('titre')->required()->maxLength(255),
            Select::make('type')
                ->options(['livre' => 'Livre', 'poeme' => 'Poème', 'manuel' => 'Manuel scolaire'])
                ->required(),
            TextInput::make('auteur')->label('Auteur / érudit')->maxLength(255),
            Select::make('langue')
                ->options(['ar' => 'Arabe', 'fr' => 'Français', 'wo' => 'Wolof', 'ff' => 'Pulaar'])
                ->default('ar')
                ->required(),
            TextInput::make('confrerie')->label('Confrérie (facultatif)')->maxLength(150),
            TextInput::make('ordre')->numeric()->default(0)->required(),
            Textarea::make('description')->rows(4)->columnSpanFull(),
            Textarea::make('aide_pedagogique')
                ->label('Aide pédagogique / notes de transmission')
                ->rows(5)
                ->columnSpanFull(),
            FileUpload::make('fichier_path')
                ->label('Fichier PDF ou audio')
                ->acceptedFileTypes(['application/pdf', 'audio/mpeg', 'audio/mp3', 'audio/ogg'])
                ->disk('public')
                ->directory('bibliotheque')
                ->visibility('public')
                ->maxSize(51200),
            TextInput::make('source_url')->label('Lien externe')->url()->maxLength(2048),
            Select::make('statut')
                ->options(['brouillon' => 'Brouillon', 'publie' => 'Publié'])
                ->default('brouillon')
                ->required(),
        ]);
    }
}
