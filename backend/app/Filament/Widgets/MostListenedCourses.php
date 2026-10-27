<?php

namespace App\Filament\Widgets;

use App\Models\Cours;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;

class MostListenedCourses extends TableWidget
{
    protected static ?int $sort = 3;

    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(Cours::query()
                ->with(['matiere:id,nom', 'cheikh.user:id,name,prenom'])
                ->orderByDesc('nombre_ecoutes')
                ->orderByDesc('telechargements')
                ->orderByDesc('id')
                ->limit(10))
            ->heading('Cours les plus écoutés')
            ->columns([
                TextColumn::make('titre')
                    ->label('Cours')
                    ->searchable(),
                TextColumn::make('matiere.nom')
                    ->label('Matière'),
                TextColumn::make('cheikh.user.name')
                    ->label('Cheikh')
                    ->formatStateUsing(fn ($state, Cours $record): string => trim(
                        ($record->cheikh?->user?->prenom ?? '').' '.($state ?? '')
                    )),
                TextColumn::make('nombre_ecoutes')
                    ->label('Écoutes')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('telechargements')
                    ->label('Téléchargements')
                    ->numeric()
                    ->sortable(),
            ])
            ->paginated(false);
    }
}
