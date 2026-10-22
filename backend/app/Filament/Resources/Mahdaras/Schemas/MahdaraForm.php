<?php

namespace App\Filament\Resources\Mahdaras\Schemas;

use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class MahdaraForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('nom')
                    ->label('Nom')
                    ->required()
                    ->maxLength(255),
                TextInput::make('wilaya')
                    ->required()
                    ->maxLength(255),
                TextInput::make('localisation')
                    ->label('Localisation')
                    ->maxLength(255),
                Textarea::make('description')
                    ->rows(5)
                    ->columnSpanFull(),
                Toggle::make('actif')
                    ->label('Active')
                    ->default(true),
            ]);
    }
}
