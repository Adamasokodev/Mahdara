<?php

namespace App\Filament\Resources\Oeuvres\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class OeuvresTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('titre')->searchable()->sortable(),
                TextColumn::make('type')->badge()->sortable(),
                TextColumn::make('auteur')->searchable(),
                TextColumn::make('langue')->badge(),
                TextColumn::make('confrerie')->searchable(),
                TextColumn::make('statut')
                    ->badge()
                    ->color(fn (string $state): string => $state === 'publie' ? 'success' : 'gray'),
            ])
            ->filters([
                SelectFilter::make('type')->options([
                    'livre' => 'Livre', 'poeme' => 'Poème', 'manuel' => 'Manuel scolaire',
                ]),
                SelectFilter::make('statut')->options(['brouillon' => 'Brouillon', 'publie' => 'Publié']),
                SelectFilter::make('langue')->options([
                    'ar' => 'Arabe', 'fr' => 'Français', 'wo' => 'Wolof', 'ff' => 'Pulaar',
                ]),
            ])
            ->recordActions([EditAction::make()])
            ->toolbarActions([BulkActionGroup::make([DeleteBulkAction::make()])]);
    }
}
