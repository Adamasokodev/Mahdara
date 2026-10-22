<?php

namespace App\Filament\Resources\Matieres\Schemas;

use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class MatiereForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('nom')
                    ->required()
                    ->maxLength(255),
                TextInput::make('slug')
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(255),
                Textarea::make('description')
                    ->rows(4)
                    ->columnSpanFull(),
                TextInput::make('icone')
                    ->label('Icône')
                    ->maxLength(255),
                TextInput::make('ordre')
                    ->numeric()
                    ->default(0)
                    ->required(),
                Toggle::make('actif')
                    ->label('Active')
                    ->default(true),
            ]);
    }
}
