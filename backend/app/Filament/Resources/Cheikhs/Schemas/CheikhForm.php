<?php

namespace App\Filament\Resources\Cheikhs\Schemas;

use App\Models\User;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;
use Illuminate\Database\Eloquent\Builder;

class CheikhForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user_id')
                    ->label('Compte du cheikh')
                    ->relationship(
                        name: 'user',
                        titleAttribute: 'name',
                        modifyQueryUsing: fn (Builder $query) => $query->where('role', 'cheikh'),
                    )
                    ->getOptionLabelFromRecordUsing(fn (User $record): string => trim("{$record->prenom} {$record->name}"))
                    ->searchable(['name', 'prenom', 'email'])
                    ->preload()
                    ->required(),
                Select::make('mahdara_id')
                    ->label('Mahdara')
                    ->relationship('mahdara', 'nom')
                    ->searchable()
                    ->preload()
                    ->required(),
                FileUpload::make('photo_path')
                    ->label('Photo du cheikh')
                    ->image()
                    ->imageEditor()
                    ->disk('public')
                    ->directory('cheikhs')
                    ->visibility('public')
                    ->maxSize(5120),
                Textarea::make('bio')
                    ->label('Biographie')
                    ->rows(5)
                    ->columnSpanFull(),
                Select::make('matieres')
                    ->label('Matières enseignées')
                    ->relationship('matieres', 'nom')
                    ->multiple()
                    ->searchable()
                    ->preload(),
                Toggle::make('verifier')
                    ->label('Profil vérifié'),
            ]);
    }
}
