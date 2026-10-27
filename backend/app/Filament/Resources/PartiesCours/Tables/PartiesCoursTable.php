<?php

namespace App\Filament\Resources\PartiesCours\Tables;

use App\Models\PartieCours;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class PartiesCoursTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('cours.titre')->label('Cours')->searchable()->sortable(),
                TextColumn::make('ordre')->label('Partie')->numeric()->sortable(),
                TextColumn::make('titre')->label('Titre')->searchable(),
                TextColumn::make('fichier_path')
                    ->label('Audio')
                    ->getStateUsing(fn (PartieCours $record): string => ($record->fichier_path || $record->source_url) ? 'Disponible' : 'Absent')
                    ->badge()
                    ->color(fn (string $state): string => $state === 'Disponible' ? 'success' : 'gray'),
            ])
            ->filters([
                SelectFilter::make('cours_id')->label('Cours')->relationship('cours', 'titre'),
            ])
            ->recordActions([EditAction::make()])
            ->toolbarActions([BulkActionGroup::make([DeleteBulkAction::make()])])
            ->defaultSort('ordre');
    }
}
