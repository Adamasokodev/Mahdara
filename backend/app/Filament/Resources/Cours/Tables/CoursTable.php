<?php

namespace App\Filament\Resources\Cours\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class CoursTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('titre')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('matiere.nom')
                    ->label('Matière')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('cheikh.user.name')
                    ->label('Cheikh')
                    ->searchable(),
                TextColumn::make('mahdara.nom')
                    ->label('Mahdara')
                    ->searchable(),
                TextColumn::make('niveau')
                    ->searchable(),
                TextColumn::make('type')
                    ->badge(),
                TextColumn::make('duree_secondes')
                    ->label('Durée (s)')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('statut')
                    ->badge()
                    ->color(fn (string $state): string => $state === 'publie' ? 'success' : 'gray'),
                TextColumn::make('publie_le')
                    ->label('Publié le')
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('nombre_ecoutes')
                    ->label('Écoutes')
                    ->numeric()
                    ->sortable()
                    ->toggleable(),
                TextColumn::make('telechargements')
                    ->label('Téléchargements')
                    ->numeric()
                    ->sortable()
                    ->toggleable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('statut')
                    ->options(['brouillon' => 'Brouillon', 'publie' => 'Publié']),
                SelectFilter::make('matiere_id')
                    ->label('Matière')
                    ->relationship('matiere', 'nom'),
                SelectFilter::make('cheikh_id')
                    ->label('Cheikh')
                    ->relationship('cheikh', 'id')
                    ->getOptionLabelFromRecordUsing(fn ($record): string => trim(
                        "{$record->user?->prenom} {$record->user?->name}"
                    )),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
