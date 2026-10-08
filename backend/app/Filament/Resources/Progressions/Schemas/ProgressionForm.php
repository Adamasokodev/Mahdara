<?php

namespace App\Filament\Resources\Progressions\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class ProgressionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('user_id')
                    ->required()
                    ->numeric(),
                TextInput::make('cours_id')
                    ->required()
                    ->numeric(),
                TextInput::make('statut')
                    ->required()
                    ->default('non_commence'),
                DatePicker::make('date_debut'),
                DatePicker::make('date_fin'),
            ]);
    }
}
