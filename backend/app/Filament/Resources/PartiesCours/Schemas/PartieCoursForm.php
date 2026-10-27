<?php

namespace App\Filament\Resources\PartiesCours\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;

class PartieCoursForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('cours_id')
                ->label('Cours')
                ->relationship('cours', 'titre')
                ->searchable()
                ->preload()
                ->required(),
            TextInput::make('ordre')->label('Numéro de la partie')->numeric()->minValue(1)->default(1)->required(),
            TextInput::make('titre')->label('Titre de la partie')->required()->maxLength(255),
            Textarea::make('contenu')->label('Cours écrit')->rows(12)->required()->columnSpanFull(),
            TextInput::make('duree_secondes')->label('Durée audio (secondes)')->numeric()->minValue(1),
            FileUpload::make('fichier_path')
                ->label('Fichier audio')
                ->acceptedFileTypes(['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/webm', 'audio/ogg', 'audio/wav'])
                ->disk('public')
                ->directory('cours/parties')
                ->visibility('public')
                ->maxSize(102400)
                ->required(fn (Get $get): bool => blank($get('source_url'))),
            TextInput::make('source_url')
                ->label('Ou lien audio externe')
                ->url()
                ->maxLength(2048)
                ->required(fn (Get $get): bool => blank($get('fichier_path'))),
        ]);
    }
}
