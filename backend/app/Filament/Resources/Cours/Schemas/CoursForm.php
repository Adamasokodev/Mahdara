<?php

namespace App\Filament\Resources\Cours\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class CoursForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('titre')
                    ->required(),
                TextInput::make('matiere')
                    ->required(),
                TextInput::make('niveau')
                    ->required(),
                TextInput::make('fichier_url')
                    ->url()
                    ->required(),
                TextInput::make('duree_minutes')
                    ->numeric()
                    ->default(null),
                TextInput::make('cheikh_id')
                    ->required()
                    ->numeric(),
                TextInput::make('mahdara_id')
                    ->required()
                    ->numeric(),
            ]);
    }
}
